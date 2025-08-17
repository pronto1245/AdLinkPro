// Integration Monitoring Dashboard Configuration
export const monitoringDashboardConfig = {
  // Dashboard layout configuration
  layout: {
    title: 'Real Data Integration Monitoring',
    refreshInterval: 30000, // 30 seconds
    theme: 'dark',
    columns: 12,
    rows: [
      {
        title: 'System Health Overview',
        height: 250,
        widgets: [
          {
            type: 'status_indicator',
            title: 'Overall Status',
            width: 3,
            dataSource: '/api/integration/health',
            config: {
              field: 'health.overall',
              statuses: {
                healthy: { color: 'green', icon: 'check-circle' },
                degraded: { color: 'yellow', icon: 'exclamation-triangle' },
                unhealthy: { color: 'red', icon: 'times-circle' }
              }
            }
          },
          {
            type: 'metric_grid',
            title: 'Active Alerts',
            width: 3,
            dataSource: '/api/integration/health',
            config: {
              metrics: [
                {
                  label: 'Total Alerts',
                  field: 'monitoring.activeAlerts',
                  format: 'number'
                },
                {
                  label: 'Critical',
                  field: 'monitoring.criticalAlerts',
                  format: 'number',
                  color: 'red'
                }
              ]
            }
          },
          {
            type: 'service_status',
            title: 'Services',
            width: 6,
            dataSource: '/api/integration/health',
            config: {
              field: 'health.services',
              displayFields: ['service', 'status', 'responseTime', 'lastCheck']
            }
          }
        ]
      },
      {
        title: 'Data Integration Metrics',
        height: 300,
        widgets: [
          {
            type: 'time_series_chart',
            title: 'API Response Times',
            width: 6,
            dataSource: '/api/integration/statistics',
            config: {
              xAxis: 'timestamp',
              yAxis: 'responseTime',
              timeWindow: '24h',
              aggregation: 'avg',
              color: '#3b82f6'
            }
          },
          {
            type: 'time_series_chart',
            title: 'Data Validation Rate',
            width: 6,
            dataSource: '/api/integration/statistics',
            config: {
              xAxis: 'timestamp',
              yAxis: 'validationRate',
              timeWindow: '24h',
              aggregation: 'avg',
              color: '#10b981',
              unit: '%'
            }
          }
        ]
      },
      {
        title: 'BI Systems Status',
        height: 200,
        widgets: [
          {
            type: 'bi_systems_grid',
            title: 'BI System Health',
            width: 12,
            dataSource: '/api/integration/health',
            config: {
              field: 'health.biSystems',
              systems: ['looker', 'metabase', 'powerbi'],
              statusColors: {
                healthy: 'green',
                error: 'red',
                'undefined': 'gray'
              }
            }
          }
        ]
      },
      {
        title: 'Recent Activity',
        height: 350,
        widgets: [
          {
            type: 'alert_feed',
            title: 'Recent Alerts',
            width: 6,
            dataSource: '/api/integration/health',
            config: {
              field: 'monitoring.recentAlerts',
              maxItems: 10,
              showResolved: false,
              severityColors: {
                critical: 'red',
                high: 'orange',
                medium: 'yellow',
                low: 'blue'
              }
            }
          },
          {
            type: 'data_stats',
            title: 'Data Processing Stats',
            width: 6,
            dataSource: '/api/integration/statistics',
            config: {
              metrics: [
                {
                  label: 'Records Processed (24h)',
                  field: 'summary.totalRecordsProcessed',
                  format: 'number'
                },
                {
                  label: 'Validation Rate',
                  field: 'summary.averageValidationRate',
                  format: 'percentage'
                },
                {
                  label: 'Integration Uptime',
                  field: 'summary.integrationUptime',
                  format: 'percentage'
                }
              ]
            }
          }
        ]
      }
    ]
  },

  // Widget configurations
  widgets: {
    status_indicator: {
      component: 'StatusIndicator',
      defaultConfig: {
        size: 'large',
        showLabel: true,
        animateChanges: true
      }
    },

    metric_grid: {
      component: 'MetricGrid',
      defaultConfig: {
        cardStyle: 'elevated',
        showTrend: true,
        animateValues: true
      }
    },

    service_status: {
      component: 'ServiceStatusTable',
      defaultConfig: {
        sortBy: 'status',
        highlightUnhealthy: true,
        showLastCheck: true
      }
    },

    time_series_chart: {
      component: 'TimeSeriesChart',
      defaultConfig: {
        type: 'line',
        smooth: true,
        showPoints: false,
        showGrid: true,
        height: 200
      }
    },

    bi_systems_grid: {
      component: 'BISystemsGrid',
      defaultConfig: {
        showConnectionTest: true,
        showLastUpdate: true,
        cardLayout: true
      }
    },

    alert_feed: {
      component: 'AlertFeed',
      defaultConfig: {
        realTime: true,
        showTimestamp: true,
        groupBySeverity: false,
        maxHeight: 300
      }
    },

    data_stats: {
      component: 'DataStatsCards',
      defaultConfig: {
        layout: 'vertical',
        showSparklines: true,
        updateInterval: 30000
      }
    }
  },

  // Data refresh configuration
  dataRefresh: {
    intervals: {
      '/api/integration/health': 10000,      // 10 seconds for health data
      '/api/integration/statistics': 60000,  // 1 minute for statistics
    },
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 2000
  },

  // Alert configuration
  alerts: {
    enabled: true,
    soundNotifications: false,
    browserNotifications: true,
    flashOnCritical: true,
    autoResolveTimeout: 300000, // 5 minutes
    severityThresholds: {
      responseTime: {
        warning: 1000,   // 1 second
        critical: 5000   // 5 seconds
      },
      validationRate: {
        warning: 90,     // 90%
        critical: 80     // 80%
      },
      errorRate: {
        warning: 5,      // 5%
        critical: 10     // 10%
      }
    }
  }
};

export default monitoringDashboardConfig;