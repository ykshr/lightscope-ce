import DestinationProvider from './provider';
import { ClickHouseDestination } from './clickhouse';

let instance: ClickHouseDestination | null = null;

export default function createDestinationProvider(): DestinationProvider {
  if (!instance) {
    instance = new ClickHouseDestination();
  }
  return instance;
}
