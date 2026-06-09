import type {
  ApiChangeSeverity,
  ApiChangeType,
  ApiFramework,
  RepositoryProvider,
  ScanStatus,
} from './repository';

export type DashboardActivityType = 'API_CHANGE' | 'REPOSITORY_ADDED' | 'SCAN_UPDATED';

export interface DashboardBreakdownItem<TKey extends string> {
  count: number;
  key: TKey;
}

export interface DashboardActivity {
  apiId: string | null;
  description: string;
  occurredAt: string;
  repositoryFullName: string | null;
  repositoryId: string | null;
  scanId: string | null;
  severity: ApiChangeSeverity | null;
  status: ScanStatus | null;
  title: string;
  type: DashboardActivityType;
}

export interface DashboardOverview {
  apiIntelligence: {
    frameworks: DashboardBreakdownItem<ApiFramework>[];
    totalApis: number;
  };
  generatedAt: string;
  recentActivity: DashboardActivity[];
  repositoryOverview: {
    providers: DashboardBreakdownItem<RepositoryProvider>[];
    totalRepositories: number;
  };
  riskOverview: {
    breakingChanges: number;
    severities: DashboardBreakdownItem<ApiChangeSeverity>[];
    totalChanges: number;
    types: DashboardBreakdownItem<ApiChangeType>[];
  };
  scanSummary: {
    activeScans: number;
    completedScans: number;
    failedScans: number;
    statuses: DashboardBreakdownItem<ScanStatus>[];
    totalScans: number;
  };
}
