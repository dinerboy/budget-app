export type Location = 'Home' | 'Garage' | 'Bank' | 'Store' | 'Work' | 'Town Hall';
export type WorldAction = { type: 'location'; location: Location } | { type: 'open-dashboard' };
export type WorldControls = { paused: boolean; x: number; y: number; interact: boolean };
export type WorldBridge = {
  controls: WorldControls;
  action: (action: WorldAction) => void;
  nearby: (label: string) => void;
};

