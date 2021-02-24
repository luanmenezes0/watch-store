import { mount } from '@vue/test-utils';

import CartItem from '@/components/CartItem';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';

let server;

const mountCartItem = () => {
  const product = server.create('product', {
    title: 'nice watch',
    price: '22.33',
  });

  const cartManager = new CartManager();

  const wrapper = mount(CartItem, {
    propsData: {
      product,
    },
    mocks: {
      $cart: cartManager,
    },
  });

  return { wrapper, product, cartManager };
};

describe('CartItem', () => {
  beforeEach(() => {
    server = makeServer({ enviroment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });
  it('should mount the component', () => {
    const { wrapper } = mountCartItem();
    expect(wrapper.vm).toBeDefined();
  });

  it('should display the title and price of the product', () => {
    const {
      wrapper,
      product: { title, price },
    } = mountCartItem();

    expect(wrapper.text()).toContain(title);
    expect(wrapper.text()).toContain(price);
  });

  it('should display quantity one when the product is first added', () => {
    const { wrapper } = mountCartItem();

    const quantity = wrapper.find('[data-testId="quantity"]').text();

    expect(quantity).toContain(quantity);
  });

  it('should increase the quantity when the plus button is clicked', async () => {
    const { wrapper } = mountCartItem();

    const plusButton = wrapper.find('[data-testId="increase"]');

    await plusButton.trigger('click');
    expect(wrapper.find('[data-testId="quantity"]').text()).toContain(2);

    await plusButton.trigger('click');
    expect(wrapper.find('[data-testId="quantity"]').text()).toContain(3);
  });

  it('should decrease the quantity when the less button is clicked', async () => {
    const { wrapper } = mountCartItem();

    const minusButton = wrapper.find('[data-testId="decrease"]');

    await minusButton.trigger('click');
    expect(wrapper.find('[data-testId="quantity"]').text()).toContain(0);
  });

  it('should not should not allow quantity to be less than 0', async () => {
    const { wrapper } = mountCartItem();

    const minusButton = wrapper.find('[data-testId="decrease"]');

    await minusButton.trigger('click');
    await minusButton.trigger('click');
    expect(wrapper.find('[data-testId="quantity"]').text()).toContain(0);
  });

  it('should display a button to remove a product', () => {
    const { wrapper } = mountCartItem();

    const removeButton = wrapper.find('[data-testId="remove"]');

    expect(removeButton.exists()).toBe(true);
  });

  it('should call cart manager removeProduct() when the button is clicked', async () => {
    const { wrapper, cartManager, product } = mountCartItem();

    const spy = jest.spyOn(cartManager, 'removeProduct');
    const removeButton = wrapper.find('[data-testId="remove"]');
    await removeButton.trigger('click');

    expect(spy).toBeCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(product.id);
  });
});
