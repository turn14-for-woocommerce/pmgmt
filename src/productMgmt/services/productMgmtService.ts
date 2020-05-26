import { Inject, Service } from 'typedi';
import { Keys } from '../../apiUsers/models/apiUser';
import { Turn14RestApi } from '../../turn14/clients/turn14RestApi';
import { Turn14RestApiFactory } from '../../turn14/clients/turn14RestApiFactory';
import { Turn14ProductDTO } from '../../turn14/dtos/turn14ProductDto';
import { WcRestApi } from '../../woocommerce/clients/wcRestApi';
import { WcRestApiFactory } from '../../woocommerce/clients/wcRestApiFactory';
import { WcBatchDTO } from '../../woocommerce/dtos/wcBatchDto';
import { WcCategoriesCache } from '../caches/wcCategoriesCache';
import { PmgmtDTO } from '../dtos/pmgmtDto';
import { WcMapper } from './wcMapper';
import { WcMapperFactory } from './wcMapperFactory';

/**
 * ProductMgmtService.
 *
 * Performs product management functions such as creating, updating, and
 * deleting products from the woocommerce store.
 *
 * @author Sam Hall <hallsamuel90@gmail.com>
 */
@Service()
export class ProductMgmtService {
  BATCH_SIZE = 5; // default 50

  @Inject()
  private readonly turn14RestApiFactory: Turn14RestApiFactory;

  @Inject()
  private readonly wcRestApiFactory: WcRestApiFactory;

  @Inject()
  private readonly wcMapperFactory: WcMapperFactory;

  /**
   * Imports a Turn14 brand's products into the WC Store.
   *
   * @param {PmgmtDTO} pmgmtDto the product management data transer object.
   */
  async import(pmgmtDto: PmgmtDTO): Promise<void> {
    const turn14Products = await this.getTurn14ProductsByBrand(
      pmgmtDto.turn14Keys,
      pmgmtDto.brandId
    );

    const wcRestApi: WcRestApi = this.wcRestApiFactory.getWcRestApi(
      pmgmtDto.siteUrl,
      pmgmtDto.wcKeys.client,
      pmgmtDto.wcKeys.secret
    );

    const wcCategoriesCache = new WcCategoriesCache(wcRestApi);
    const wcMapper: WcMapper = this.wcMapperFactory.getWcMapper(
      wcCategoriesCache
    );

    const wcProducts = new WcBatchDTO();
    for (const turn14Product of turn14Products) {
      const wcProduct = await wcMapper.turn14ToWc(turn14Product);
      wcProducts.create.push(wcProduct);

      if (wcProducts.totalSize() == this.BATCH_SIZE) {
        await wcRestApi.createProducts(wcProducts);
        wcProducts.create.length = 0;
        break; // TODO: remove
      }
    }
    console.info('👍 Import complete!');
  }

  /**
   * Deletes a brand's products from the WooCommerce store.
   *
   * @param {PmgmtDTO} pmgmtDto the product management object containing keys.
   */
  async delete(pmgmtDto: PmgmtDTO): Promise<void> {
    const wcRestApi = this.wcRestApiFactory.getWcRestApi(
      pmgmtDto.siteUrl,
      pmgmtDto.wcKeys.client,
      pmgmtDto.wcKeys.secret
    );

    // const brandProducts = wcRestApi.fetchBrandProducts(pmgmtDto.brandId);
    // should throw if cannot get brandProducts

    // const productIds = getProductIds(brandProducts);

    // wcRestApi.deleteProducts(productIds);
  }

  /**
   * Fetches turn14 products from the api using the supplied brandId.
   *
   * @param {Keys} turn14Keys the keys for access to the turn14 api.
   * @param {string} brandId the id for the products to be retrieved.
   * @returns {Turn14ProductDTO[]} a list of turn14 products.
   */
  private async getTurn14ProductsByBrand(
    turn14Keys: Keys,
    brandId: string
  ): Promise<Turn14ProductDTO[]> {
    const turn14RestApi: Turn14RestApi = this.turn14RestApiFactory.getTurn14RestApi(
      turn14Keys.client,
      turn14Keys.secret
    );

    await turn14RestApi.authenticate();

    const turn14Products = await turn14RestApi.fetchAllBrandData(
      Number(brandId)
    );

    return turn14Products;
  }

  private getProductIds() {
    throw new Error('meesage not yet implemented');
  }
}