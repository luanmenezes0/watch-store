/* eslint-disable no-undef */
/// <reference types="cypress" />

import { makeServer } from '../../miragejs/server';

context('Store', () => {
  let server;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });
  it('should display the store', () => {
    server.createList('product', 10);

    cy.visit('http://localhost:3000/');

    cy.get('body').contains('Brand');
    cy.get('body').contains('Wrist Watch');
  });

  context('Store > Search for products', () => {
    it('should type in the search', () => {
      cy.visit('http://localhost:3000/');

      cy.get('input[type="search"]')
        .type('some text here')
        .should('have.value', 'some text here');
    });

    it('should search product', () => {
      server.create('product', {
        title: 'nice watch',
      });
      server.createList('product', 10);

      cy.visit('http://localhost:3000/');

      cy.get('input[type="search"]').type('nice watch');

      cy.get('[data-testId="search-for"]').submit();

      cy.get('[data-testId="product-card"]').should('have.length', 1);
    });
  });
});
