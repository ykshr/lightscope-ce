import { useState, useEffect } from 'react';
import { ArticleTrendQuery } from '@/__generated__/graphql';
import { AreaCategoryConfig, AreaChartDataItem } from '@/components/charts/templates/AreaStacked';

export default function useProcessData(data: ArticleTrendQuery | undefined) {
  const [chartData, setChartData] = useState<AreaChartDataItem[]>([]);
  const [chartConfigs, setChartConfigs] = useState<AreaCategoryConfig[]>([]);

  const validateDataMap = (map: { [dateString: string]: AreaChartDataItem }, date: any) => {
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    if (!map[dateString]) map[dateString] = { date };
    return dateString;
  };

  const returnIdTotal = () => 'total';

  const returnIdCategoryAge = (age: string | null | undefined) => {
    if (age) return age;
    return;
  };

  const returnIdCategoryApp = (
    appType: string | null | undefined,
    app: string | null | undefined
  ) => {
    if (app) return app;
    if (appType) return appType;
    return;
  };

  const returnIdCategoryDevice = (
    deviceType: string | null | undefined,
    device: string | null | undefined
  ) => {
    if (device) return device;
    if (deviceType) return deviceType;
    return;
  };

  const returnIdCategoryGender = (gender: string | null | undefined) => {
    if (gender) return gender;
    return;
  };

  const returnIdCategoryGeo = (
    continent: string | null | undefined,
    country: string | null | undefined,
    subdivision: string | null | undefined
  ) => {
    if (subdivision) return subdivision;
    if (country) return country;
    if (continent) return continent;
    return;
  };

  const returnIdCategoryReferrer = (
    domain: string | null | undefined,
    referrer: string | null | undefined
  ) => {
    if (referrer) return referrer;
    if (domain) return domain;
    return;
  };

  const returnIdCategoryUtm = (
    source: string | null | undefined,
    medium: string | null | undefined,
    campaign: string | null | undefined
  ) => {
    if (source || medium || campaign) {
      return `${source || ''} ${medium || ''} ${campaign || ''}`.trim();
    }
    return;
  };

  useEffect(() => {
    const chartConfigMap: { [id: string]: AreaCategoryConfig } = {};
    const chartDataMap: { [dateString: string]: AreaChartDataItem } = {};

    // Process trend part of the data to extract date and value for the chart
    data?.trend?.total?.forEach(({ date, value }) => {
      const id = returnIdTotal();
      if (!id) return;
      const dateString = validateDataMap(chartDataMap, date);
      chartDataMap[dateString][id] = value;
    });
    data?.trend?.categoryAge?.forEach(({ date, value, age }) => {
      const id = returnIdCategoryAge(age);
      if (!id) return;
      const dateString = validateDataMap(chartDataMap, date);
      chartDataMap[dateString][id] = value;
    });
    data?.trend?.categoryApp?.forEach(({ date, value, appType, app }) => {
      const id = returnIdCategoryApp(appType, app);
      if (!id) return;
      const dateString = validateDataMap(chartDataMap, date);
      chartDataMap[dateString][id] = value;
    });
    data?.trend?.categoryDevice?.forEach(({ date, value, deviceType, device }) => {
      const id = returnIdCategoryDevice(deviceType, device);
      if (!id) return;
      const dateString = validateDataMap(chartDataMap, date);
      chartDataMap[dateString][id] = value;
    });
    data?.trend?.categoryGender?.forEach(({ date, value, gender }) => {
      const id = returnIdCategoryGender(gender);
      if (!id) return;
      const dateString = validateDataMap(chartDataMap, date);
      chartDataMap[dateString][id] = value;
    });
    data?.trend?.categoryGeo?.forEach(({ date, value, continent, country, subdivision }) => {
      const id = returnIdCategoryGeo(continent, country, subdivision);
      if (!id) return;
      const dateString = validateDataMap(chartDataMap, date);
      chartDataMap[dateString][id] = value;
    });
    data?.trend?.categoryReferrer?.forEach(({ date, value, domain, referrer }) => {
      const id = returnIdCategoryReferrer(domain, referrer);
      if (!id) return;
      const dateString = validateDataMap(chartDataMap, date);
      chartDataMap[dateString][id] = value;
    });
    data?.trend?.categoryUtm?.forEach(({ date, value, source, medium, campaign }) => {
      const id = returnIdCategoryUtm(source, medium, campaign);
      if (!id) return;
      const dateString = validateDataMap(chartDataMap, date);
      chartDataMap[dateString][id] = value;
    });

    // Process total part of the data to extract total value for the legend
    data?.total?.total?.forEach(({ value }) => {
      const id = returnIdTotal();
      if (!id) return;
      chartConfigMap[id] = {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        total: (chartConfigMap[id]?.total || 0) + value,
      };
    });
    data?.total?.categoryAge?.forEach(({ value, age }) => {
      const id = returnIdCategoryAge(age);
      if (!id) return;
      chartConfigMap[id] = {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        total: (chartConfigMap[id]?.total || 0) + value,
      };
    });
    data?.total?.categoryApp?.forEach(({ value, appType, app }) => {
      const id = returnIdCategoryApp(appType, app);
      if (!id) return;
      chartConfigMap[id] = {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        total: (chartConfigMap[id]?.total || 0) + value,
      };
    });
    data?.total?.categoryDevice?.forEach(({ value, deviceType, device }) => {
      const id = returnIdCategoryDevice(deviceType, device);
      if (!id) return;
      chartConfigMap[id] = {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        total: (chartConfigMap[id]?.total || 0) + value,
      };
    });
    data?.total?.categoryGender?.forEach(({ value, gender }) => {
      const id = returnIdCategoryGender(gender);
      if (!id) return;
      chartConfigMap[id] = {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        total: (chartConfigMap[id]?.total || 0) + value,
      };
    });
    data?.total?.categoryGeo?.forEach(({ value, continent, country, subdivision }) => {
      const id = returnIdCategoryGeo(continent, country, subdivision);
      if (!id) return;
      chartConfigMap[id] = {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        total: (chartConfigMap[id]?.total || 0) + value,
      };
    });
    data?.total?.categoryReferrer?.forEach(({ value, domain, referrer }) => {
      const id = returnIdCategoryReferrer(domain, referrer);
      if (!id) return;
      chartConfigMap[id] = {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        total: (chartConfigMap[id]?.total || 0) + value,
      };
    });
    data?.total?.categoryUtm?.forEach(({ value, source, medium, campaign }) => {
      const id = returnIdCategoryUtm(source, medium, campaign);
      if (!id) return;
      chartConfigMap[id] = {
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
        total: (chartConfigMap[id]?.total || 0) + value,
      };
    });

    setChartData(Object.values(chartDataMap));
    setChartConfigs(Object.values(chartConfigMap));
  }, [data]);

  return { chartData, chartConfigs };
}
