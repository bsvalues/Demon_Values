// Update the imports at the top
import { performanceMonitor } from './testing/PerformanceMonitor';
import { PerformanceDisplay } from './testing/PerformanceDisplay';

// Add to the component's state
const [alerts, setAlerts] = useState<RegressionAlert[]>([]);
const [trends, setTrends] = useState<any>(null);

// Update the useEffect that runs tests
useEffect(() => {
  const runTests = async () => {
    const results = await runAllTests();
    setTestResults(results);

    const memoryCheck = await detectMemoryLeaks();
    if (memoryCheck.hasLeak) {
      console.warn('Potential memory leak detected:', memoryCheck);
    }

    // Add metrics to performance monitor
    performanceMonitor.addMetrics({
      timestamp: Date.now(),
      metrics: results.individual,
      dataSize: properties.length,
    });

    // Check for regressions
    const newAlerts = performanceMonitor.detectRegressions();
    setAlerts(newAlerts);

    // Get performance trends
    const newTrends = performanceMonitor.getPerformanceTrends();
    setTrends(newTrends);

    setPerformanceMetrics(memoryCheck);
  };
  runTests();
}, [properties.length]);

// Update the performance metrics display in the render method
{performanceMetrics && (
  <PerformanceDisplay
    metrics={performanceMetrics}
    alerts={alerts}
    trends={trends}
  />
)}