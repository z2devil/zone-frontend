import RouteConfig from './route';

export default {
  INTRO: new RouteConfig({ path: '/', name: 'Intro' }),
  NOTE: new RouteConfig({ path: '/note', name: 'Note' }),
  COSER_SET: new RouteConfig({ path: '/coserset', name: 'CoserSet' }),
  TEST: new RouteConfig({ path: '/test', name: 'Test' }),
};
