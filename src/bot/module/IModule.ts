
interface IModule {
  name:string;
  description:string;
  usage:string;

  exec(message:string): void;
}

export=IModule;
