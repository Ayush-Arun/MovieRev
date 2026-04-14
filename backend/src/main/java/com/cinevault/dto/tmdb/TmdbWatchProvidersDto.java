package com.cinevault.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class TmdbWatchProvidersDto {
    private Map<String, CountryProviders> results;

    public Map<String, CountryProviders> getResults() { return results; }
    public void setResults(Map<String, CountryProviders> results) { this.results = results; }

    public static class CountryProviders {
        private List<Provider> flatrate;

        public List<Provider> getFlatrate() { return flatrate; }
        public void setFlatrate(List<Provider> flatrate) { this.flatrate = flatrate; }
    }

    public static class Provider {
        @JsonProperty("provider_id")
        private Integer providerId;
        @JsonProperty("provider_name")
        private String providerName;
        @JsonProperty("logo_path")
        private String logoPath;

        public Integer getProviderId() { return providerId; }
        public void setProviderId(Integer providerId) { this.providerId = providerId; }
        public String getProviderName() { return providerName; }
        public void setProviderName(String providerName) { this.providerName = providerName; }
        public String getLogoPath() { return logoPath; }
        public void setLogoPath(String logoPath) { this.logoPath = logoPath; }
    }
}
