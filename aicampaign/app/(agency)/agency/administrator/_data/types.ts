export type AdminManager = {
  id: string;
  name: string;
};

export type AdminAccount = {
  id: string;
  name: string;
  /**
   * "admin" = konts pie Administrator
   * citādi = managerId
   */
  ownerId: string;
};

export type AdminState = {
  managers: AdminManager[];
  accounts: AdminAccount[];
};

export const ADMIN_OWNER_ID = "admin";