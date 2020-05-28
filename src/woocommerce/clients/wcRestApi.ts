import axios, { AxiosInstance } from 'axios';
import https from 'https';
import _, { Dictionary } from 'lodash';
import { WcBatchDTO } from '../dtos/wcBatchDto';
import { WcCategoryDTO } from '../dtos/wcCategoryDto';
import { WcError } from '../errors/wcError';

/**
 * WooCommerceRestApi.
 *
 * Client for communicating with the WooCommerce api.
 *
 * @author Sam Hall <hallsamuel90@gmail.com>
 */
export class WcRestApi {
  private static BATCH_PRODUCTS_RESOURCE = 'wp-json/wc/v3/products/batch';
  private static PRODUCT_CATEOGORIES_RESOURCE =
    'wp-json/wc/v3/products/categories';

  private axiosClient: AxiosInstance;

  /**
   * Creates a new instance of WcRestApi with the provided parameters.
   *
   * @param {string} wcUrl the target url of the woocommerce store.
   * @param {string} wcClient the client key for communicating with the api.
   * @param {string} wcSecret the secret key for communicating with the api.
   */
  constructor(wcUrl: string, wcClient: string, wcSecret: string) {
    this.axiosClient = axios.create({
      baseURL: wcUrl,
      auth: {
        username: wcClient,
        password: wcSecret,
      },
      // TODO: remove in production. skips ssl for local dev -SH
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  /**
   * Batch creates, updates, and deletes woocomerce products,
   * limited to 100 at a time.
   *
   * @param {WcBatchDTO} wcProducts the products to be sent to the store.
   * @returns {Promise<JSON>} the response from woocommerce.
   */
  async createProducts(wcProducts: WcBatchDTO): Promise<JSON> {
    try {
      const response = await this.axiosClient.post(
        WcRestApi.BATCH_PRODUCTS_RESOURCE,
        wcProducts
      );
      return response.data;
    } catch (e) {
      console.error('🔥 ' + e);
    } finally {
      throw new WcError(
        'createProducts(), something went wrong communicating with WooCommerce.'
      );
    }
  }

  /**
   * Fetches all products of a particular brand.
   *
   * @param {string} brandId the unique id of the brand.
   * @returns {Promise<JSON[]>} the response from woocommerce.
   */
  async fetchProductsByBrand(brandId: string): Promise<JSON[]> {
    try {
      const response = await this.axiosClient.get(
        WcRestApi.PRODUCT_CATEOGORIES_RESOURCE
      );
      return response.data;
    } catch (e) {
      console.error('🔥 ' + e);
    } finally {
      throw new WcError(
        'fetchCategories(), something went wrong communicating with WooCommerce.'
      );
    }
  }

  /**
   * Fetches all categories from woocommerce and returns them as
   * a map of name:category
   *
   * @returns {Promise<Dictionary<JSON>>} the response from woocommerce.
   */
  async fetchAllCategories(): Promise<Dictionary<JSON>> {
    let allData: JSON[] = [];
    let i = 1;
    while (true) {
      const pageData = await this.fetchCategories(i);
      if (!Array.isArray(pageData) || !pageData.length) {
        break;
      }
      allData = allData.concat(pageData);
      i++;
    }
    return _.keyBy(allData, 'name');
  }

  /**
   * Fetches categories from woocommerce
   *
   * @param {number} pageNumber the page number to query.
   * @returns {Promise<JSON[]>} the response from woocommerce.
   */
  async fetchCategories(pageNumber: number): Promise<JSON[]> {
    try {
      const response = await this.axiosClient.get(
        WcRestApi.PRODUCT_CATEOGORIES_RESOURCE,
        {
          params: {
            page: pageNumber,
          },
        }
      );
      return response.data;
    } catch (e) {
      console.error('🔥 ' + e);
    } finally {
      throw new WcError(
        'fetchCategories(), something went wrong communicating with WooCommerce.'
      );
    }
  }

  /**
   * Creates a new woocommerce category
   *
   * @param {WcCategoryDTO} wcCategoryDto
   * @returns {Promise<JSON>} the response from woocommerce.
   */
  async createCategory(wcCategoryDto: WcCategoryDTO): Promise<JSON> {
    try {
      const response = await this.axiosClient.post(
        WcRestApi.PRODUCT_CATEOGORIES_RESOURCE,
        wcCategoryDto
      );
      return response.data;
    } catch (e) {
      console.error('🔥 ' + e);
    } finally {
      throw new WcError(
        'createCategory(), something went wrong communicating with WooCommerce.'
      );
    }
  }
}
