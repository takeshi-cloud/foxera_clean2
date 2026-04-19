export type EventLog = {
  id: string;
  user_id: string;
  pair: string;
  tf: string;
  tfType: string;
  dir: string;
  phase: string;
  note: string;
  mode: string;
  action?: string;
  event_time: string;
  image_url: string | null;
};
