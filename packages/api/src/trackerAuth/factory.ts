import { NoAuthTrackerProvider } from './noAuth';
import TrackerAuthProvider from './provider';

export default function createTrackerAuthProvider(): TrackerAuthProvider {
  return new NoAuthTrackerProvider();
}
