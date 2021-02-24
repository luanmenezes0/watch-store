import { mount } from '@vue/test-utils';

import CartItem from '@/components/CartItem';
import Cart from '@/components/Cart';
import { makeServer } from '@/miragejs/server';
import { CartManager } from '@/managers/CartManager';

const mountCart = (props) => {
  const cartManager = new CartManager();

  const wrapper = mount(Cart, {
    propsData: { ...props },
    mocks: {
      $cart: cartManager,
    },
  });

  return { wrapper, cartManager };
};

describe('Cart', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ enviroment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });
  it('should mount the component', () => {
    const { wrapper } = mountCart();

    expect(wrapper.vm).toBeDefined();
  });

  it('should emit close event when the button is clicked', async () => {
    const { wrapper } = mountCart();
    const button = wrapper.find('[data-testId="close-button"]');

    await button.trigger('click');

    expect(wrapper.emitted().close).toBeTruthy();
    expect(wrapper.emitted().close).toHaveLength(1);
  });

  it('should hide the cart when the prop isOpen is false', () => {
    const { wrapper } = mountCart();

    expect(wrapper.classes()).toContain('hidden');
  });

  it('should hide the cart when the prop isOpen is true', () => {
    const { wrapper } = mountCart({ isOpen: true });

    expect(wrapper.classes()).not.toContain('hidden');
  });

  it('should show text "Cart is empty" when there is no products', () => {
    const { wrapper } = mountCart();

    expect(wrapper.text()).toContain('Cart is empty');
  });

  it('should display Cart Items', () => {
    const products = server.createList('product', 2);
    const { wrapper } = mountCart({ products });

    expect(wrapper.findAllComponents(CartItem)).toHaveLength(2);
    expect(wrapper.text()).not.toContain('Cart is empty');
  });

  it('should clear products when the clear button is clicked', async () => {
    const products = server.createList('product', 2);
    const { wrapper, cartManager } = mountCart({ products });

    const clearButton = wrapper.find('[data-testId="clear-button"]');

    const spy = jest.spyOn(cartManager, 'clearProducts');
    await clearButton.trigger('click');

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should clear cart when checkout is clicked', async () => {
    const products = server.createList('product', 2);
    const { wrapper, cartManager } = mountCart({ products });

    const clearButton = wrapper.find('[data-testId="checkout"]');

    const spy = jest.spyOn(cartManager, 'clearCart');
    await clearButton.trigger('click');

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
