import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://49a9bc3e24c6d9a1867c571f5a6c0dd3@o4511603972440064.ingest.us.sentry.io/4511603982663680',    
  debug: false,                      
  tracesSampleRate: 1.0,
});