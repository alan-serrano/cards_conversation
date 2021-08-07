import React from 'react';
import { Switch, Redirect } from 'react-router-dom';

import { RouteWithLayout } from './components';
import { Main as MainLayout, Minimal as MinimalLayout } from './layouts';

import {
  Dashboard as DashboardView,
  // ProductList as ProductListView,
  UserList as UserListView,
  // Typography as TypographyView,
  // Icons as IconsView,
  Account as AccountView,
  // Settings as SettingsView,
  SignUp as SignUpView,
  SignIn as SignInView,
  Topics,
  NotFound as NotFoundView,
} from './views';

const AdminRoutes = () => {
  return (
    <Switch>
      <Redirect
        exact
        from="/admin"
        to="/admin/dashboard"
      />
      <RouteWithLayout
        component={DashboardView}
        exact
        layout={MainLayout}
        path="/admin/dashboard"
      />
      <RouteWithLayout
        component={UserListView}
        exact
        layout={MainLayout}
        path="/admin/users"
      />
      <RouteWithLayout
        component={UserListView}
        exact
        layout={MainLayout}
        path="/admin/cards"
      />
      <RouteWithLayout
        component={Topics}
        exact
        layout={MainLayout}
        path="/admin/topics"
      />
      <RouteWithLayout
        component={AccountView}
        exact
        layout={MainLayout}
        path="/admin/account"
      />
      <RouteWithLayout
        component={SignUpView}
        exact
        layout={MinimalLayout}
        path="/sign-up"
      />
      <RouteWithLayout
        component={SignInView}
        exact
        layout={MinimalLayout}
        path="/sign-in"
      />
      <RouteWithLayout
        component={NotFoundView}
        exact
        layout={MinimalLayout}
        path="/not-found"
      />
      {/* <Redirect to="/not-found" /> */}
    </Switch>
  );
};

export default AdminRoutes;
