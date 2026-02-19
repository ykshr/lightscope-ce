export const categoryUrlParamsToVariables = (urlParams: { [name: string]: any }) => {
  const { category } = urlParams;
  if (!category) {
    return {
      isArticles: true,
    };
  }

  if (category === 'age' || category === 'ageAge') {
    return {
      isCategoryAge: true,
      isCategoryAgeAge: category === 'ageAge',
      includeAges: urlParams['includeAges'],
      excludeAges: urlParams['excludeAges'],
    };
  }

  if (category === 'app' || category === 'appApp' || category === 'appAppType') {
    return {
      isCategoryApp: true,
      isCategoryAppAppType: category === 'appAppType',
      isCategoryAppApp: category === 'appApp',
      includeAppTypes: urlParams['includeAppTypes'],
      excludeAppTypes: urlParams['excludeAppTypes'],
      includeApps: urlParams['includeApps'],
      excludeApps: urlParams['excludeApps'],
    };
  }

  if (category === 'device' || category === 'deviceDeviceType' || category === 'deviceDevice') {
    return {
      isCategoryDevice: true,
      isCategoryDeviceDeviceType: category === 'deviceDeviceType',
      isCategoryDeviceDevice: category === 'deviceDevice',
      includeDeviceTypes: urlParams['includeDeviceTypes'],
      excludeDeviceTypes: urlParams['excludeDeviceTypes'],
      includeDeviceVendors: urlParams['includeDeviceVendors'],
      excludeDeviceVendors: urlParams['excludeDeviceVendors'],
      includeDevices: urlParams['includeDevices'],
      excludeDevices: urlParams['excludeDevices'],
    };
  }

  if (category === 'gender' || category === 'genderGender') {
    return {
      isCategoryGender: true,
      isCategoryGenderGender: category === 'genderGender',
      includeGenders: urlParams['includeGenders'],
      excludeGenders: urlParams['excludeGenders'],
    };
  }

  if (
    category === 'geo' ||
    category === 'geoContinent' ||
    category === 'geoCountry' ||
    category === 'geoSubdivision'
  ) {
    return {
      isCategoryGeo: true,
      isCategoryGeoContinent: category === 'geoContinent',
      isCategoryGeoCountry: category === 'geoCountry',
      isCategoryGeoSubdivision: category === 'geoSubdivision',
      includeContinents: urlParams['includeContinents'],
      excludeContinents: urlParams['excludeContinents'],
      includeSubdivisions: urlParams['includeSubdivisions'],
      excludeSubdivisions: urlParams['excludeSubdivisions'],
      includeCountries: urlParams['includeCountries'],
      excludeCountries: urlParams['excludeCountries'],
      includeCities: urlParams['includeCities'],
      excludeCities: urlParams['excludeCities'],
    };
  }

  if (category === 'referrer' || category === 'referrerDomain' || category === 'referrerReferrer') {
    return {
      isCategoryReferrer: true,
      isCategoryReferrerDomain: category === 'referrerDomain',
      isCategoryReferrerReferrer: category === 'referrerReferrer',
      includeDomains: urlParams['includeDomains'],
      excludeDomains: urlParams['excludeDomains'],
      includeReferrers: urlParams['includeReferrers'],
      excludeReferrers: urlParams['excludeReferrers'],
    };
  }

  if (
    category === 'utm' ||
    category === 'utmSource' ||
    category === 'utmMedium' ||
    category === 'utmCampaign'
  ) {
    return {
      isCategoryUtm: true,
      isCategoryUtmSource: category === 'utmSource',
      isCategoryUtmMedium: category === 'utmMedium',
      isCategoryUtmCampaign: category === 'utmCampaign',
      includeSources: urlParams['includeSources'],
      excludeSources: urlParams['excludeSources'],
      includeMediums: urlParams['includeMediums'],
      excludeMediums: urlParams['excludeMediums'],
      includeCampaigns: urlParams['includeCampaigns'],
      excludeCampaigns: urlParams['excludeCampaigns'],
    };
  }

  return;
};
