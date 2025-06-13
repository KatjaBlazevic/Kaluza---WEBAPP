import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import OnamaPage from 'src/pages/OSNOVNE/ONamaPage.vue';
import { Quasar } from 'quasar';

const createWrapper = () => {
  return mount(OnamaPage, {
    global: {
      plugins: [Quasar],
      stubs: {
        QLayout: { template: '<div><slot></slot></div>' },
        QPageContainer: { template: '<div><slot></slot></div>' },
        QPage: { template: '<div class="onama-page"><slot></slot></div>' },
        QImg: {
          props: ['src', 'ratio'],
          template: '<div class="q-img-stub" :src="src"></div>',
        },
        QCard: { template: '<div><slot></slot></div>' },
        QRow: { template: '<div><slot></slot></div>' },
        QCol: { template: '<div><slot></slot></div>' },
      },
    },
  });
};

describe('OnamaPage', () => {
  it('should render the hero section with correct titles', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('.onama-page').exists()).toBe(true);
    expect(wrapper.find('.hero-section').exists()).toBe(true);
    expect(wrapper.find('.hero-title').text()).toBe('Upoznaj Pets&Care');
    expect(wrapper.find('.hero-subtitle').text()).toContain('Strastveno gradimo zajednicu za ljubimce i njihove vlasnike');
  });

  it('should display the "Naša misija" section with its content and image', () => {
    const wrapper = createWrapper();
    const misijaSection = wrapper.find('[data-testid="misija-section"]');

    expect(misijaSection.exists()).toBe(true);
    expect(misijaSection.find('.section-title').text()).toBe('Naša misija');
    expect(misijaSection.find('.section-text').text()).toContain('Pets&Care je nastao iz ljubavi prema životinjama');

    const missionImage = misijaSection.find('.q-img-stub');
    expect(missionImage.exists()).toBe(true);
    expect(missionImage.attributes('src')).toMatch(/misija\.jpg$/);
  });

  it('should display the "Tko smo mi?" section with its content and image', () => {
    const wrapper = createWrapper();
    const tkoSmoMiSection = wrapper.find('[data-testid="tko-smo-mi-section"]');

    expect(tkoSmoMiSection.exists()).toBe(true);
    expect(tkoSmoMiSection.find('.section-title').text()).toBe('Tko smo mi?');
    expect(tkoSmoMiSection.find('.section-text').text()).toContain('Pets&Care je zajednica koja povezuje ljubitelje životinja');

    const teamImage = tkoSmoMiSection.find('.q-img-stub');
    expect(teamImage.exists()).toBe(true);
    expect(teamImage.attributes('src')).toMatch(/tim-slika\.jpg$/);
  });

  it('should apply mobile-centering classes where specified', () => {
    const wrapper = createWrapper();

    const onamaPageWrapper = wrapper.find('.onama-page');
    expect(onamaPageWrapper.exists()).toBe(true);
    expect(onamaPageWrapper.find('.hero-title').classes()).not.toContain('mobile-center');

    expect(onamaPageWrapper.find('.section-title.mobile-center').exists()).toBe(true);
    expect(onamaPageWrapper.find('.section-text.mobile-center').exists()).toBe(true);
  });
});
