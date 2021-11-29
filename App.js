import React from 'react';

import Routes from './navigation/index';

import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Setting a timer']);
LogBox.ignoreAllLogs();

export default function App() {
  return <Routes />;
}