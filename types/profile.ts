export type ProfileSettingsItem = {
  id: string;
  label: string;
  value?: string;
  type: "select" | "placeholder";
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  stats: {
    classes: number;
    attendance: number;
    teachers: number;
  };
};
