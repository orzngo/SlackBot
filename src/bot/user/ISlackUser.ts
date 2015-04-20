interface ISlackUser {
  id: string;
  name: string;
  deleted: boolean;
  color: string;
  profile:any;//必要になったら書く
  is_admin: boolean;
  is_owner: boolean;
  has_2fa: boolean;
  has_files: boolean;
}
