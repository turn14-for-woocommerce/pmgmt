const Turn14RestApi = require('../clients/turn14RestApi');
/**
 * Import Service imports products from Turn14 into WC store
 */
class ImportService {
  /**
   * Imports brand products into WC Store
   *
   * @param {ImportBrandsDto} importBrandsDto
   */
  async import(importBrandsDto) {
    const turn14RestApi = new Turn14RestApi(importBrandsDto.turn14Client,
        importBrandsDto.turn14Secret);

    await turn14RestApi.authenticate();
    const brandItems = await turn14RestApi.fetchBrandItems(83, 1);
    const brandItemsData = await turn14RestApi.fetchBrandItemsData(83, 1);
    const brandPricing = await turn14RestApi.fetchBrandPricing(83, 1);
    const brandInventory= await turn14RestApi.fetchBrandInventory(83, 1);


    // loop brands, import items, media, pricing, inventory

    // every 50 items, send to WC
    console.info('👍 Import complete!');
  }
}

module.exports = ImportService;
