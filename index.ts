import 'react-native-reanimated';
import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';

import App from './App';

// Make sure to register the app component with both methods
AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);