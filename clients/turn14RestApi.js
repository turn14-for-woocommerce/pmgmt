const axios = require('axios');

const BASE_URL = 'https://apitest.turn14.com/v1';

/**
 * Turn14 Rest Api Client
 */
class Turn14RestApi {
  /**
   * Constructs a new Turn14RestApi client
   *
   * @param {string} turn14Client
   * @param {string} turn14Secret
   */
  constructor(turn14Client, turn14Secret) {
    this.turn14Client = turn14Client;
    this.turn14Secret = turn14Secret;
    this.axiosClient = axios.create({
      baseURL: BASE_URL,
    });
  }

  /**
   * Authenticates the Turn14API and attaches the auth token to
   * all subsequent requests
   */
  async authenticate() {
    const TOKEN_RESOURCE = '/token';
    try {
      const response = await this.axiosClient.post(TOKEN_RESOURCE, {
        'grant_type': 'client_credentials',
        'client_id': this.turn14Client,
        'client_secret': this.turn14Secret,
      });
      if (response.status = 200) {
        console.info('🔑 Authenticated Turn14 API!');
        const token = response.data.access_token;
        this.axiosClient.defaults.headers.common =
          {'Authorization': `Bearer ${token}`};
      }
    } catch (e) {
      console.error('🔥 ' + e);
    }
  }

  /**
   * Fetches brand items
   *
   * @param {int} brandId
   * @param {int} pageNumber
   */
  async fetchBrandItems(brandId, pageNumber) {
    const BRAND_ITEMS_RESOURCE = `items/brand/${brandId}`;
    try {
      const response = await this.axiosClient.get(BRAND_ITEMS_RESOURCE, {
        params: {
          page: pageNumber,
        },
      });
      return response.data;
    } catch (e) {
      if (e.response.status = 401) {
        console.error('🔥 ERROR: Token expired or invalid, ' +
          'attempting to authenticate!');
        await this.authenticate();
        this.fetchBrandItems(brandId, pageNumber);
      } else {
        console.error('🔥 ' + e);
      }
    }
  }

  /**
   * Fetches brand items data
   *
   * @param {int} brandId
   * @param {int} pageNumber
   */
  async fetchBrandItemsData(brandId, pageNumber) {
    const BRAND_ITEMS_RESOURCE = `items/data/brand/${brandId}`;
    try {
      const response = await this.axiosClient.get(BRAND_ITEMS_RESOURCE, {
        params: {
          page: pageNumber,
        },
      });
      return response.data;
    } catch (e) {
      if (e.response.status = 401) {
        console.error('🔥 ERROR: Token expired or invalid, ' +
          'attempting to authenticate!');
        await this.authenticate();
        this.fetchBrandItemsData(brandId, pageNumber);
      } else {
        console.error('🔥 ' + e);
      }
    }
  }

  /**
   * Fetches brand pricing
   *
   * @param {int} brandId
   * @param {int} pageNumber
   */
  async fetchBrandPricing(brandId, pageNumber) {
    const BRAND_PRICING_RESOURCE = `pricing/brand/${brandId}`;
    try {
      const response = await this.axiosClient.get(BRAND_PRICING_RESOURCE, {
        params: {
          page: pageNumber,
        },
      });
      return response.data;
    } catch (e) {
      if (e.response.status = 401) {
        console.error('🔥 ERROR: Token expired or invalid, ' +
            'attempting to authenticate!');
        await this.authenticate();
        this.fetchBrandPricing(brandId, pageNumber);
      } else {
        console.error('🔥 ' + e);
      }
    }
  }

  /**
   * Fetches brand inventory
   *
   * @param {int} brandId
   * @param {int} pageNumber
   */
  async fetchBrandInventory(brandId, pageNumber) {
    const BRAND_INVENTORY_RESOURCE = `inventory/brand/${brandId}`;
    try {
      const response = await this.axiosClient.get(BRAND_INVENTORY_RESOURCE, {
        params: {
          page: pageNumber,
        },
      });
      return response.data;
    } catch (e) {
      if (e.response.status = 401) {
        console.error('🔥 ERROR: Token expired or invalid, ' +
          'attempting to authenticate!');
        await this.authenticate();
        this.fetchBrandInventory(brandId, pageNumber);
      } else {
        console.error('🔥 ' + e);
      }
    }
  }
}

module.exports = Turn14RestApi;
