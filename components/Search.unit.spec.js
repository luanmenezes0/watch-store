import { mount } from '@vue/test-utils';
import Search from '@/components/Search';

describe('Search - unit test', () => {
  it('should mount the component', () => {
    const wrapper = mount(Search);

    expect(wrapper.vm).toBeDefined();
  });

  it('should emit search event when the form is submitted', async () => {
    const wrapper = mount(Search);

    const term = 'a nice watch';

    await wrapper.find('input[type="search"]').setValue(term);
    await wrapper.find('form').trigger('submit');

    expect(wrapper.emitted().doSearch).toBeTruthy();

    expect(wrapper.emitted().doSearch.length).toBe(1);

    expect(wrapper.emitted().doSearch[0]).toEqual([{ term }]);
  });

  it('should emit search event when search input is cleared', async () => {
    const wrapper = mount(Search);
    const term = 'a nice watch';
    const input = wrapper.find('input[type="search"]');
    await input.setValue(term);
    await input.setValue('');

    expect(wrapper.emitted().doSearch).toBeTruthy();

    expect(wrapper.emitted().doSearch.length).toBe(1);

    expect(wrapper.emitted().doSearch[0]).toEqual([{ term: '' }]);
  });
});
