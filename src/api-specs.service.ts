import { Injectable } from '@nestjs/common';
import { ApiSpec } from './models/api-spec.model';
import { readdir, readFile } from 'fs';
import { load } from 'js-yaml';

@Injectable()
export class ApiSpecsService {
  public getApiSpecById(id: string): ApiSpec | null {
    if (!this.rawDataRoot[id]) throw new Error(`Cannot find api spec with id "${id}"`);
    return new ApiSpec(id, this.rawDataRoot[id], this);
  }

  private readonly rawDataRoot: Record<string, any> = {};

  constructor() {
    this.loadFiles();
  }

  public async getApiSpecs(): Promise<ApiSpec[]> {
    return Object.keys(this.rawDataRoot).map((spec) => new ApiSpec(spec, this.rawDataRoot[spec], this));
  }

  public loadFiles(): Promise<void> {
    return new Promise((resolve, reject) => {
      readdir('./specs', (err, files) => {
        if (err) reject(err);
        else Promise.all(files.map((file) => this.parseFile(file))).then(() => resolve());
      });
    });
  }

  private parseFile(fileName: string): Promise<void> {
    const namespace = [fileName.substring(0, fileName.lastIndexOf('.'))];
    return new Promise<void>((resolve, reject) => {
      readFile(`./specs/${fileName}`, (err, data) => {
        if (err) {
          delete this.rawDataRoot[namespace[0]];
          reject(err);
        } else {
          this.rawDataRoot[namespace[0]] = load(data.toString());
          resolve();
        }
      });
    });
  }

  public followRef({ namespace }: { namespace: string[] }, ref: string): any {
    if (typeof ref !== 'string') this.error('LoadSpec', namespace, '$ref must always be a string');
    const path = ref.split('/');
    try {
      if (path[0] !== '#') throw new Error('$ref must start with "#/"');
      return this.getRelativePath(this.rawDataRoot[namespace[0]], path.slice(1));
    } catch (e) {
      this.error('LoadSpec', namespace, `Invalid $ref. ${ref} (${(e as Error).message})`);
    }
  }

  private getRelativePath(base: any, path: string[]): any {
    const nextStep = path[0];
    if (path.length === 1) return base[nextStep];
    return this.getRelativePath(base[nextStep], path.slice(1));
  }

  private error(phase: 'LoadSpec', namespace: string[], message: string) {
    throw new Error(`[${phase}][${nsString(namespace)}] ${message}`);
  }
}

function nsString(namespace: string[]): string {
  return namespace.join(' > ');
}
