import { mount } from '@vue/test-utils';
import ProductCard from '@/components/ProductCard';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';

let server;

const mountProductCard = () => {
  const product = server.create('product', {
    title: 'nice watch',
    price: '22.93',
    image:
      'https://images.unsplash.com/photo-1495856458515-0637185db551?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80',
  });

  const cartManager = new CartManager();

  const wrapper = mount(ProductCard, {
    propsData: {
      product: server.create('product', {
        id: '26',
        title: 'nice watch',
        price: '22.93',
        image:
          'https://images.unsplash.com/photo-1495856458515-0637185db551?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80',
      }),
    },
    mocks: {
      $cart: cartManager,
    },
  });

  return {
    wrapper,
    product,
    cartManager,
  };
};

describe('ProductCard - unit', () => {
  beforeEach(() => {
    server = makeServer({ enviroment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('should match snapshot', () => {
    const { wrapper } = mountProductCard();

    expect(wrapper.element).toMatchSnapshot();
  });
  it('should mount de component', () => {
    const { wrapper } = mountProductCard();

    expect(wrapper.vm).toBeDefined();
    expect(wrapper.text()).toContain('nice watch');
  });

  it('should add product to cart when the button is clicked', async () => {
    const { wrapper, product, cartManager } = mountProductCard();

    const spy = jest.spyOn(cartManager, 'open');
    const spyAdd = jest.spyOn(cartManager, 'addProduct');

    await wrapper.find('button').trigger('click');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spyAdd).toHaveBeenCalledTimes(1);
    expect(spyAdd).toHaveBeenCalledWith(product);
  });
});
