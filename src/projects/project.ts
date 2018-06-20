
export abstract class Project {
  public static projectId: string;
  public static projectName: string;
  protected prettierFiles: string;

  public getPrettierFiles() {
    return this.prettierFiles;
  }

  public abstract runExtra(targetDir: string): Promise<any>;
}
