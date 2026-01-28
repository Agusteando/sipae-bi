// New file to manage theme state globally so ECharts can react
export const useTheme = () => {
  const isDark = useState<boolean>("theme-dark", () => false);

  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  const chartTextColor = computed(() => (isDark.value ? "#e5e7eb" : "#374151"));
  const chartLineColor = computed(() => (isDark.value ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"));
  const chartGridColor = computed(() => (isDark.value ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"));

  return { isDark, toggleTheme, chartTextColor, chartLineColor, chartGridColor };
};