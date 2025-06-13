import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexPage from 'src/pages/OSNOVNE/IndexPage.vue';
import { Quasar, QBtn, QIcon } from 'quasar';

const createWrapper = () => {
  return mount(IndexPage, {
    global: {
      plugins: [Quasar],
      stubs: {
        QLayout: { template: '<div><slot></slot></div>' },
        QPageContainer: { template: '<div><slot></slot></div>' },
        QPage: { template: '<div class="index-page"><slot></slot></div>' },
        QBtn: {
          template: '<button class="q-btn-stub"><slot></slot></button>',
          props: ['label', 'to', 'href', 'color', 'textColor', 'size', 'unelevated', 'target'],
        },
        QIcon: { template: '<i></i>', props: ['name', 'size'] },
        QRow: { template: '<div><slot></slot></div>' },
        QCol: { template: '<div><slot></slot></div>' },
      },
    },
  });
};

describe('IndexPage', () => {
  it('should render the hero section with correct title and find vet button', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('.index-page').exists()).toBe(true);
    expect(wrapper.find('.hero-section').exists()).toBe(true);
    expect(wrapper.find('.hero-title').text()).toBe('Briga za tvoje ljubimce na jednom mjestu');

    const findVetBtn = wrapper.findComponent(QBtn);
    expect(findVetBtn.exists()).toBe(true);
    expect(findVetBtn.props().label).toBe('PRONAĐI VETERINARA');
    expect(findVetBtn.props().to).toBe('/vets');
  });

  it('should display the "O NAMA" info card with correct content and button', () => {
    const wrapper = createWrapper();
    const aboutCard = wrapper.find('[data-testid="about-card"]');

    expect(aboutCard.exists()).toBe(true);
    expect(aboutCard.find('h2').text()).toBe('O NAMA');
    expect(aboutCard.find('p').text()).toMatch(/Saznajte više o nama\s*i našoj misiji\./);

    const aboutBtn = aboutCard.findComponent(QBtn);
    expect(aboutBtn.exists()).toBe(true);
    expect(aboutBtn.props().label).toBe('Saznaj više');
    expect(aboutBtn.props().to).toBe('/about');
  });

  it('should display the "PRIDRUŽI SE" info card with correct content and button', () => {
    const wrapper = createWrapper();
    const joinCard = wrapper.find('[data-testid="join-card"]');

    expect(joinCard.exists()).toBe(true);
    expect(joinCard.find('h2').text()).toBe('PRIDRUŽI SE');
    expect(joinCard.find('p').text()).toMatch(/Registrirajte se i\s*pridružite našoj zajednici!/);

    const joinBtn = joinCard.findComponent(QBtn);
    expect(joinBtn.exists()).toBe(true);
    expect(joinBtn.props().label).toBe('REGISTRIRAJ SE');
    expect(joinBtn.props().to).toBe('/register');
  });

  it('should display the "DOGAĐAJI" info card with correct content and button', () => {
    const wrapper = createWrapper();
    const eventsCard = wrapper.find('[data-testid="events-card"]');

    expect(eventsCard.exists()).toBe(true);
    expect(eventsCard.find('h2').text()).toBe('DOGADAJI');
    expect(eventsCard.find('p').text()).toMatch(/Otkrijte nadolazeće\s*događaje i okupljanja\./);

    const eventsBtn = eventsCard.findComponent(QBtn);
    expect(eventsBtn.exists()).toBe(true);
    expect(eventsBtn.props().label).toBe('POGLEDAJ');
    expect(eventsBtn.props().to).toBe('/events');
  });

  it('should display the "TRAŽIŠ ČUVALICU" action button with correct link', () => {
    const wrapper = createWrapper();
    const actionBtn = wrapper.findComponent(QBtn);

    const cuvalicaBtn = wrapper.findAllComponents(QBtn).filter(btn => btn.props().label === 'TRAŽIŠ ČUVALICU ZA SVOG LJUBIMCA?').at(0);
    expect(cuvalicaBtn.exists()).toBe(true);
    expect(cuvalicaBtn.props().label).toBe('TRAŽIŠ ČUVALICU ZA SVOG LJUBIMCA?');
    expect(cuvalicaBtn.props().href).toBe('https://www.siterice.hr');
    expect(cuvalicaBtn.props().target).toBe('_blank');
  });
});
