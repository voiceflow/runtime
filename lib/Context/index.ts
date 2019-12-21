import Lifecycle from '@/lib/Lifecycle';
// import Controller from "@/lib/Controller";

class Context extends Lifecycle {
  constructor(public versionID: string, private state, private controller: Controller) {
    super();
  }

  async update(): Promise<void> {

  }
};

export default Context;
