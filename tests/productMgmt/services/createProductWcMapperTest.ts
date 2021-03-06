/* eslint-disable @typescript-eslint/camelcase */
import { expect } from 'chai';
import { instance, mock, when } from 'ts-mockito';
import { WcCategoriesCache } from '../../../src/productMgmt/caches/wcCategoriesCache';
import { CreateProductWcMapper } from '../../../src/productMgmt/services/createProductWcMapper';
import { WcCategoryIdDTO } from '../../../src/woocommerce/dtos/wcCategoryIdDto';
import { Turn14FakeData } from './turn14FakeData';
describe('WcMapper tests', () => {
  let createProductWcMapper: CreateProductWcMapper;

  beforeEach(() => {
    const mockWcCategoriesCache: WcCategoriesCache = mock(WcCategoriesCache);
    const mockWcCategoriesCacheInstance = instance(mockWcCategoriesCache);

    const fakeCategoryId = 5;
    const fakeWcCategoryIdDto = new WcCategoryIdDTO(fakeCategoryId);
    when(mockWcCategoriesCache.getCategory('Brake')).thenResolve(
      fakeWcCategoryIdDto
    );

    const fakeSubCategoryId = 3;
    const fakeSubCategoryIdDto = new WcCategoryIdDTO(fakeSubCategoryId);
    when(
      mockWcCategoriesCache.getSubCategory('Drums and Rotors', 'Brake')
    ).thenResolve(fakeSubCategoryIdDto);

    when(mockWcCategoriesCache.getBrand('DBA')).thenResolve(18);

    createProductWcMapper = new CreateProductWcMapper(
      mockWcCategoriesCacheInstance
    );
  });

  describe('#turn14ToWc', () => {
    it('should not return null attributes', async () => {
      const fakeTurn14ProductDto = Turn14FakeData.getFakeTurn14ProductDTO();

      const wcCreateProductDto = await createProductWcMapper.turn14ToWc(
        fakeTurn14ProductDto
      );

      expect(wcCreateProductDto.attributes).to.not.be.null;
    });

    it('should not die when itemAttributes is undefined', async () => {
      const undefinedItemAttributesTurn14ProductDto = Turn14FakeData.getUndefinedItemAttributesProductDTO();

      const wcCreateProductDto = await createProductWcMapper.turn14ToWc(
        undefinedItemAttributesTurn14ProductDto
      );

      expect(wcCreateProductDto).to.not.be.null;
    });

    it('should return correctly mapped attributes for WcCreateProductDTO', async () => {
      const fakeTurn14ProductDto = Turn14FakeData.getFakeTurn14ProductDTO();

      const wcCreateProductDtoAttributes = await createProductWcMapper.turn14ToWc(
        fakeTurn14ProductDto
      );

      expect(wcCreateProductDtoAttributes.name).to.equal(
        'DBA 92-95 MR-2 Turbo Rear Drilled & Slotted 4000 Series Rotor'
      );
      expect(wcCreateProductDtoAttributes.type).to.equal('simple');
      expect(wcCreateProductDtoAttributes.short_description).to.equal(
        'DBA 92-95 MR-2 Turbo Rear Drilled & Slotted 4000 Series Rotor'
      );
      expect(wcCreateProductDtoAttributes.sku).to.equal('4583XS');
      expect(wcCreateProductDtoAttributes.brand_id).to.equal(18);
      expect(wcCreateProductDtoAttributes.dimensions.length).to.equal(15);
      expect(wcCreateProductDtoAttributes.dimensions.width).to.equal(15);
      expect(wcCreateProductDtoAttributes.dimensions.height).to.equal(4);
      expect(wcCreateProductDtoAttributes.weight).to.equal(13);
    });

    it('should not return null inventory', () => {
      const fakeTurn14ProductDto = Turn14FakeData.getFakeTurn14ProductDTO();

      const wcCreateProductDtoInventory = createProductWcMapper.turn14ToWc(
        fakeTurn14ProductDto
      );

      expect(wcCreateProductDtoInventory).to.not.be.null;
    });

    it('should return correctly mapped inventory for WcCreateProductDTO', async () => {
      const fakeTurn14ProductDto = Turn14FakeData.getFakeTurn14ProductDTO();

      const wcCreateProductDtoInventory = await createProductWcMapper.turn14ToWc(
        fakeTurn14ProductDto
      );

      expect(wcCreateProductDtoInventory.manage_stock).to.equal(true);
      expect(wcCreateProductDtoInventory.backorders).to.equal('notify');
      expect(wcCreateProductDtoInventory.stock_quantity).to.equal(7);
    });

    it('should return WcCreateProductDTO using the short description if no other is available', async () => {
      const fakeTurn14ProductDto = Turn14FakeData.getFakeTurn14ProductDTONoLongDescription();

      const wcCreateProductDtoInventory = await createProductWcMapper.turn14ToWc(
        fakeTurn14ProductDto
      );

      expect(wcCreateProductDtoInventory.description).to.equal(
        'Baja Designs 40in OnX6 Racer Arc Series Driving Pattern Wide LED Light Bar'
      );
    });

    it('should return WcCreateProductDTO with properly mapped categories', async () => {
      const fakeTurn14ProductDto = Turn14FakeData.getFakeTurn14ProductDTO();

      const actual = await createProductWcMapper.turn14ToWc(
        fakeTurn14ProductDto
      );

      expect(actual.categories).to.have.lengthOf(2);
      expect(actual.categories).to.deep.include.members([{ id: 5 }, { id: 3 }]);
    });
  });

  it('should return WcCreateProductDTO with properly mapped brand(s)', async () => {
    const fakeTurn14ProductDto = Turn14FakeData.getFakeTurn14ProductDTO();

    const actual = await createProductWcMapper.turn14ToWc(fakeTurn14ProductDto);

    expect(actual.brands).to.have.lengthOf(1);
    expect(actual.brands).to.include.members([18]);
  });

  it('should set primary image', async () => {
    const fakeTurn14ProductDto = Turn14FakeData.getFakeTurn14ProductDTO();

    const actual = await createProductWcMapper.turn14ToWc(fakeTurn14ProductDto);

    expect(actual.images).to.have.lengthOf(1);
    expect(actual.images[0]).to.have.property(
      'src',
      'https://d32vzsop7y1h3k.cloudfront.net/cf5fe9a38d8506d29ecfa29b1034c25b.JPG'
    );
  });

  it('should set primary image to thumbnail if unavailable', async () => {
    const fakeTurn14ProductDto = Turn14FakeData.getFakeTurn14ProductDTOWithNoImage();

    const actual = await createProductWcMapper.turn14ToWc(fakeTurn14ProductDto);

    expect(actual.images).to.have.lengthOf(1);
    expect(actual.images[0]).to.have.property(
      'src',
      'https://d5otzd52uv6zz.cloudfront.net/be0798de'
    );
  });

  it('should default to thumbnail if primary image is too big', async () => {
    const fakeTurn14ProductDto = Turn14FakeData.getFakeTurn14ProductDTOWithBigImage();

    const actual = await createProductWcMapper.turn14ToWc(fakeTurn14ProductDto);

    expect(actual.images).to.have.lengthOf(1);
    expect(actual.images[0]).to.have.property(
      'src',
      'https://d5otzd52uv6zz.cloudfront.net/be0798de'
    );
  });

  it('should set backorders to notify if product is carried regularly but out of stock', async () => {
    const fakeTurn14ProductDto = Turn14FakeData.getFakeTurn14ProductDTOWithBigImage();

    const actual = await createProductWcMapper.turn14ToWc(fakeTurn14ProductDto);

    expect(actual.backorders).to.equal('notify');
    expect(actual.backorders_allowed).to.equal(true);
  });
});
