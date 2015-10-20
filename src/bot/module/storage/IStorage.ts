interface IStorage {
  save(data:string, filename:string): Boolean;
  load(filename:string): string;
}

export=IStorage;
