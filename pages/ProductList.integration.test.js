import Vue from 'vue';
import { mount } from '@vue/test-utils';
import axios from 'axios';

import ProductCard from '@/components/ProductCard';
import Search from '@/components/Search';
import { makeServer } from '@/miragejs/server';
import ProductList from '.';

let server;

jest.mock('axios', () => ({
  get: jest.fn(),
}));

const getProducts = (quantity = 10, overrides = []) => {
  let overrideList = [];

  if (overrides.length > 0) {
    overrideList = overrides.map((override) =>
      server.create('product', override)
    );
  }
  return [...server.createList('product', quantity), ...overrideList];
};

const mountProductList = async (
  quantity = 10,
  overrides = [],
  shouldReject = false
) => {
  const products = getProducts(quantity, overrides);

  if (shouldReject) {
    axios.get.mockReturnValueOnce(Promise.reject(new Error('')));
  } else {
    axios.get.mockReturnValueOnce(Promise.resolve({ data: { products } }));
  }

  const wrapper = mount(ProductList, {
    mocks: {
      $axios: axios,
    },
  });

  await Vue.nextTick();

  return { wrapper, products };
};

describe('Product List - integration', () => {
  beforeEach(() => {
    server = makeServer({ enviroment: 'test' });
    jest.clearAllMocks();
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should mount the component', async () => {
    const { wrapper } = await mountProductList();

    expect(wrapper.vm).toBeDefined();
  });

  it('should mount Search', async () => {
    const { wrapper } = await mountProductList();

    expect(wrapper.findComponent(Search)).toBeDefined();
  });

  it('should call axios.get on component mount', async () => {
    await mountProductList();

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/api/products');
  });

  it('should mount ProductList 10 times', async () => {
    const { wrapper } = await mountProductList();
    const cards = wrapper.findAllComponents(ProductCard);

    expect(cards).toHaveLength(10);
  });

  it('should display error messages if the error message rejects', async () => {
    const { wrapper } = await mountProductList(10, [], true);

    expect(wrapper.text()).toContain('Problema ao carregar a lista');
  });

  it('should filter the list with the search term', async () => {
    const { wrapper } = await mountProductList(10, [
      {
        title: 'My nice watch',
      },
      {
        title: 'My other watch',
      },
    ]);

    const search = wrapper.findComponent(Search);
    search.find('input[type="search"]').setValue('watch');
    await search.find('form').trigger('submit');

    expect(wrapper.vm.searchTerm).toEqual('watch');
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(2);
  });

  it('should filter the list when the input is cleared', async () => {
    const { wrapper } = await mountProductList(10, [
      {
        title: 'My nice watch',
      },
    ]);

    const search = wrapper.findComponent(Search);
    search.find('input[type="search"]').setValue('watch');
    await search.find('form').trigger('submit');

    search.find('input[type="search"]').setValue('');
    await search.find('form').trigger('submit');

    expect(wrapper.vm.searchTerm).toEqual('');
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(11);
  });

  it('should display the amount of products', async () => {
    const { wrapper } = await mountProductList(27);

    const label = wrapper.find('[data-testId="total-amount"]');

    expect(label.text()).toEqual('27 Products');
  });

  it('should display product (singular) when theres only one', async () => {
    const { wrapper } = await mountProductList(1);

    const label = wrapper.find('[data-testId="total-amount"]');

    expect(label.text()).toEqual('1 Product');
  });
});
