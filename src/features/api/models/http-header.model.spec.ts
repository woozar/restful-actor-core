import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { HttpHeader } from './http-header.model';
import { Response } from './response.model';

jest.mock('./callback-url.model');

describe('Http Header', () => {
  let specService: DeepMockProxy<ApiSpecsService>;
  let parent: DeepMockProxy<Response>;

  beforeEach(() => {
    specService = mockDeep<ApiSpecsService>();
    parent = mockDeep<Response>({ namespace: ['test'] });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('throws an error when creating with empty name', () => {
    expect(() => new HttpHeader(parent, '', {}, specService)).toThrow(new NsError([], '[name] must be a string and not empty'));
  });

  it('throws an error when creating without rawData', () => {
    expect(() => new HttpHeader(parent, 'name', null, specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating with stringified rawData', () => {
    expect(() => new HttpHeader(parent, 'name', 'null', specService)).toThrow(new NsError([], 'this is not based on an object'));
  });

  it('throws an error when creating without schema', () => {
    expect(() => new HttpHeader(parent, 'name', {}, specService)).toThrow(new NsError([], '[schema] mandatory property missing or empty'));
  });

  it('throws an error when creating with schema as string', () => {
    expect(() => new HttpHeader(parent, 'name', { schema: JSON.stringify({ type: 'string' }) }, specService)).toThrow(
      new NsError([], '[schema] is not a object but a string'),
    );
  });

  it('throws an error when creating with description object', () => {
    expect(() => new HttpHeader(parent, 'name', { schema: { type: 'string' }, description: {} }, specService)).toThrow(
      new NsError([], '[description] must be null or a string'),
    );
  });

  it('creates a new http header', () => {
    const httpHeader = new HttpHeader(parent, 'cookie', { schema: { type: 'string' }, description: 'descr', example: 'asd' }, specService);

    expect(httpHeader.namespace).toEqual(['test', 'header: cookie']);
    expect(httpHeader.parent).toEqual(parent);
    expect(httpHeader.description).toEqual('descr');
    expect(httpHeader.example).toEqual('"asd"');
    expect(httpHeader.name).toEqual('cookie');
    expect(httpHeader.rawSchema).toEqual({ type: 'string' });
    expect(httpHeader.schema).toEqual(JSON.stringify({ type: 'string' }));
  });

  it('creates a new http content with a $ref to its schema', () => {
    specService.followRef.mockReturnValueOnce({ type: 'string' });

    const httpHeader = new HttpHeader(parent, 'cookie', { schema: { $ref: '#/schema/bar' } }, specService);

    expect(httpHeader.description).toBeNull();
    expect(httpHeader.example).toBeNull();

    expect(httpHeader.rawSchema).toEqual({ type: 'string' });
    expect(httpHeader.schema).toEqual(JSON.stringify({ type: 'string' }));
    expect(specService.followRef).toBeCalledWith(httpHeader, '#/schema/bar');
    expect(specService.followRef).toBeCalledTimes(1);
  });

  it('follows $ref', () => {
    specService.followRef.mockReturnValueOnce({ schema: { type: 'string' }, description: 'descr', example: 'asd' });
    const httpHeader = new HttpHeader(parent, 'cookie', { $ref: '#/headers/my-header' }, specService);

    expect(httpHeader.namespace).toEqual(['test', 'header: cookie']);
    expect(httpHeader.parent).toEqual(parent);
    expect(httpHeader.description).toEqual('descr');
    expect(httpHeader.example).toEqual('"asd"');
    expect(httpHeader.name).toEqual('cookie');
    expect(httpHeader.rawSchema).toEqual({ type: 'string' });
    expect(httpHeader.schema).toEqual(JSON.stringify({ type: 'string' }));
    expect(specService.followRef).toBeCalledWith(httpHeader, '#/headers/my-header');
  });
});
