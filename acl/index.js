"use strict";

/**
 * Module dependencies
 */
var acl = require("acl");
const { USERS } = require("../constant/index");

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Permissions
 */
acl.allow([
  {
    roles: [USERS.ROLE.ADMIN],
    allows: [
      {
        resources: "/apis/users/",
        permissions: ["get", "post"],
      },
      {
        resources: "/apis/users/paging",
        permissions: ["post"],
      },
      {
        resources: "/apis/users/:_id",
        permissions: ["put", "delete"],
      },
      {
        resources: "/apis/books/",
        permissions: ["get", "post"],
      },
      {
        resources: "/apis/books/paging",
        permissions: ["post"],
      },
      {
        resources: "/apis/books/home",
        permissions: ["post"],
      },
      {
        resources: "/apis/books/:_id",
        permissions: ["put", "delete"],
      },
      {
        resources: "/apis/categories/",
        permissions: ["get", "post"],
      },
      {
        resources: "/apis/categories/paging",
        permissions: ["post"],
      },
      {
        resources: "/apis/categories/:_id",
        permissions: ["put", "delete"],
      },
    ],
  },
  {
    roles: [USERS.ROLE.CONTRIBUTOR],
    allows: [
      {
        resources: "/apis/categories/",
        permissions: ["get", "post"],
      },
      {
        resources: "/apis/categories/paging",
        permissions: ["post"],
      },
      {
        resources: "/apis/books/",
        permissions: "*",
      },
      {
        resources: "/apis/books/paging",
        permissions: ["post"],
      },
      {
        resources: "/apis/books/home",
        permissions: ["post"],
      },
      {
        resources: "/apis/books/:_id",
        permissions: ["put", "delete"],
      },
      {
        resources: "/apis/users/",
        permissions: ["get"],
      },
    ],
  },
  {
    roles: [USERS.ROLE.NORMAL],
    allows: [
      // {
      //   resources: "/apis/books/paging",
      //   permissions: ["post"],
      // },
      {
        resources: "/apis/books/home",
        permissions: ["post"],
      },
      {
        resources: "/apis/categories/paging",
        permissions: ["post"],
      },
      {
        resources: "/apis/categories/",
        permissions: ["get"],
      },
      {
        resources: "/apis/users/",
        permissions: ["get", "post"],
      },
    ],
  },
]);

module.exports = acl;
