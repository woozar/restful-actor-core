import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApiSpec } from './models/spec.model';
import { readdir, readFile } from 'fs/promises';
import { load } from 'js-yaml';

@Injectable()
export class ApiSpecsService implements OnModuleInit {
  public getApiSpecById(id: string): ApiSpec | null {
    if (!this.rawDataRoot[id]) throw new Error(`Cannot find api spec with id "${id}"`);
    return new ApiSpec(id, this.rawDataRoot[id], this);
  }

  private readonly rawDataRoot: Record<string, any> = {};

  async onModuleInit(): Promise<void> {
    const files = await readdir('./specs');
    await Promise.all(files.map((file) => this.parseFile(file)));
  }

  public getApiSpecs(): ApiSpec[] {
    return Object.keys(this.rawDataRoot).map((spec) => new ApiSpec(spec, this.rawDataRoot[spec], this));
  }

  private async parseFile(fileName: string): Promise<void> {
    const namespace = [fileName.substring(0, fileName.lastIndexOf('.'))];
    const data = await readFile(`./specs/${fileName}`).catch((e) => {
      delete this.rawDataRoot[namespace[0]];
      throw new Error(`Could not load spec file (${e.message})`);
    });
    this.rawDataRoot[namespace[0]] = load(data.toString());
  }

  public followRef({ namespace }: { namespace: string[] }, ref: string): any {
    if (typeof ref !== 'string') this.error('LoadSpec', namespace, '$ref must always be a string');
    const path = ref.split('/');
    try {
      if (path[0] !== '#') throw new Error('$ref must start with "#/"');
      if (!this.rawDataRoot[namespace[0]]) throw new Error('unknown spec');
      return this.getRelativePath(this.rawDataRoot[namespace[0]], path.slice(1));
    } catch (e) {
      this.error('LoadSpec', namespace, `Invalid $ref. ${ref} (${(e as Error).message})`);
    }
  }

  private getRelativePath(base: any, path: string[]): any {
    const nextStep = path[0];
    if (!base[nextStep]) throw new Error(`Invalid path: Cannot find ${nextStep}`);
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
