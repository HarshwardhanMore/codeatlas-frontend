'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';

import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { useAuth } from '@/features/auth/auth-provider';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { repositoryService, RepositoryApiError } from '@/services/repositories/repository-service';

import type { DependencyGraphResponse } from '@/types/repository';
import type { ReactNode } from 'react';
import type { Edge, Node } from 'reactflow';

const GRAPH_COLUMN_COUNT = 4;
const GRAPH_NODE_HEIGHT = 96;
const GRAPH_NODE_WIDTH = 260;
const GRAPH_X_GAP = 320;
const GRAPH_Y_GAP = 150;

function getRepositoryErrorMessage(error: unknown): string {
  if (error instanceof RepositoryApiError) {
    return error.message;
  }

  return 'Dependency graph request failed.';
}

function truncateLabel(value: string): string {
  if (value.length <= 44) {
    return value;
  }

  return `${value.slice(0, 18)}...${value.slice(-18)}`;
}

function toFlowNodes(graph: DependencyGraphResponse): Node[] {
  return graph.nodes.map((node, index) => ({
    data: {
      label: truncateLabel(node.label),
    },
    id: node.id,
    position: {
      x: (index % GRAPH_COLUMN_COUNT) * GRAPH_X_GAP,
      y: Math.floor(index / GRAPH_COLUMN_COUNT) * GRAPH_Y_GAP,
    },
    style: {
      borderColor: node.type === 'EXTERNAL' ? '#cbd5e1' : '#2563eb',
      borderRadius: 8,
      fontSize: 12,
      height: GRAPH_NODE_HEIGHT,
      padding: 12,
      width: GRAPH_NODE_WIDTH,
    },
    type: node.type === 'EXTERNAL' ? 'output' : 'default',
  }));
}

function toFlowEdges(graph: DependencyGraphResponse): Edge[] {
  return graph.edges.map((edge) => ({
    animated: false,
    data: {
      specifier: edge.specifier,
    },
    id: edge.id,
    label: edge.kind,
    source: edge.source,
    target: edge.target,
  }));
}

export function DependencyGraphWorkspace(): ReactNode {
  const searchParams = useSearchParams();
  const repositoryId = searchParams.get('id');
  const { accessToken, status } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [graph, setGraph] = useState<DependencyGraphResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken || !repositoryId) {
      return undefined;
    }

    const currentRepositoryId = repositoryId;
    const token = accessToken;
    let isMounted = true;

    async function loadDependencyGraph(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const response = await repositoryService.getDependencyGraph(token, currentRepositoryId);

        if (isMounted) {
          setGraph(response);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getRepositoryErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDependencyGraph();

    return (): void => {
      isMounted = false;
    };
  }, [accessToken, repositoryId, status]);

  const flowNodes = useMemo(() => (graph ? toFlowNodes(graph) : []), [graph]);
  const flowEdges = useMemo(() => (graph ? toFlowEdges(graph) : []), [graph]);

  return (
    <ProtectedRoute>
      <div className="w-full">
        {isLoading ? <LoadingState label="Loading dependency graph" /> : null}

        {error ? (
          <ErrorState
            action={
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
                href={repositoryId ? `/repositories/detail?id=${repositoryId}` : '/repositories'}
              >
                Back to repository
              </Link>
            }
            message={error}
            recovery="This can happen when the repository has no completed scan, the graph is unavailable, or your session cannot access the repository. Run a scan and retry from the repository detail page."
            title="Dependency graph unavailable"
          />
        ) : null}

        {!isLoading && !error && graph?.nodes.length === 0 ? (
          <EmptyState
            action={
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                href={`/repositories/detail?id=${graph.repositoryId}`}
              >
                Open repository
              </Link>
            }
            description="No persisted dependencies are available yet. Run a repository analysis first; the graph is generated from stored scanner metadata only."
            title="No dependency graph"
          />
        ) : null}

        {!isLoading && !error && graph && graph.nodes.length > 0 ? (
          <div className="grid gap-6">
            <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-accent">Dependency graph</p>
                  <h1 className="mt-2 text-3xl font-semibold text-foreground">
                    Repository relationships
                  </h1>
                  <p className="mt-3 text-sm text-muted">
                    {graph.nodes.length.toString()} nodes / {graph.edges.length.toString()} edges
                  </p>
                </div>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
                  href={`/repositories/detail?id=${graph.repositoryId}`}
                >
                  Repository
                </Link>
              </div>
            </section>

            <section className="h-[640px] overflow-hidden rounded-lg border border-border bg-white shadow-soft">
              <ReactFlow edges={flowEdges} fitView nodes={flowNodes}>
                <Background color="#e2e8f0" gap={20} />
                <Controls />
                <MiniMap pannable zoomable />
              </ReactFlow>
            </section>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
