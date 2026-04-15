import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_ENDPOINTS } from "../Config/api";
import { apiFetch } from "../Utils/apiFetch";

const MasterDataContext = createContext(null);
const CACHE_KEY = "master_data_cache_v2";

export const MasterDataProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [shippingProviders, setShippingProviders] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMasterData = useCallback(async (forceRefresh = false) => {
    
    try {
      setLoading(true);
      setError(null);

      // 1. Check Session Storage first (if not forcing a refresh)
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (!forceRefresh && cachedData) {
        const parsed = JSON.parse(cachedData);
        setVendors(parsed.vendors);
        setCountries(parsed.countries);
        setWarehouses(parsed.warehouses);
        setShippingProviders(parsed.shippingProviders);
        setPaymentTerms(parsed.paymentTerms);
        setLoading(false);
        return;
      }

      // 2. Fetch from API if no cache or forceRefresh is true
      const [vData, cData, wData, sData, pData] = await Promise.all([
        apiFetch(API_ENDPOINTS.vendors),
        apiFetch(API_ENDPOINTS.countries),
        apiFetch(API_ENDPOINTS.org_warehouses),
        apiFetch(API_ENDPOINTS.shipping_providers),
        apiFetch(API_ENDPOINTS.payment_terms),
      ]);

      const freshData = {
        vendors: Array.isArray(vData) ? vData : (vData?.data || []),
        countries: cData?.results || [],
        warehouses: wData?.data || [],
        shippingProviders: sData?.data || [],
        paymentTerms: pData?.data || [],
      };

      // 3. Update States
      setVendors(freshData.vendors);
      setCountries(freshData.countries);
      setWarehouses(freshData.warehouses);
      setShippingProviders(freshData.shippingProviders);
      setPaymentTerms(freshData.paymentTerms);

      // 4. Save to Session Storage
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  // Function to clear cache and re-fetch (use this after a successful Update/Delete)
  const refreshMasterData = () => fetchMasterData(true);

  return (
    <MasterDataContext.Provider
      value={{
        vendors,
        countries,
        warehouses,
        shippingProviders,
        paymentTerms,
        loading,
        error,
        refreshMasterData
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
};

export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (!context) throw new Error("useMasterData must be used inside MasterDataProvider");
  return context;
};
export default useMasterData;