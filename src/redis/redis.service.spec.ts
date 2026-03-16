import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

const mockRedisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  quit: jest.fn().mockResolvedValue('OK'),
};

jest.mock('ioredis', () => {
  const mock = jest.fn().mockImplementation(() => mockRedisClient);
  (mock as any).default = mock;
  return mock;
});

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6379,
                REDIS_PASSWORD: '',
                REDIS_TTL: 3600,
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should call client.get with the given key', async () => {
      mockRedisClient.get.mockResolvedValue('value');
      const result = await service.get('test-key');
      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
      expect(result).toBe('value');
    });
  });

  describe('set', () => {
    it('should call client.set with key, value, EX, and ttl', async () => {
      mockRedisClient.set.mockResolvedValue('OK');
      await service.set('test-key', 'test-value', 60);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'test-key',
        'test-value',
        'EX',
        60,
      );
    });

    it('should use default TTL when not provided', async () => {
      mockRedisClient.set.mockResolvedValue('OK');
      await service.set('test-key', 'test-value');
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'test-key',
        'test-value',
        'EX',
        3600,
      );
    });
  });

  describe('del', () => {
    it('should call client.del with the given key', async () => {
      mockRedisClient.del.mockResolvedValue(1);
      await service.del('test-key');
      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      mockRedisClient.exists.mockResolvedValue(1);
      const result = await service.exists('test-key');
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      mockRedisClient.exists.mockResolvedValue(0);
      const result = await service.exists('test-key');
      expect(result).toBe(false);
    });
  });

  describe('setJson / getJson', () => {
    it('should serialize and deserialize JSON values', async () => {
      const data = { foo: 'bar', count: 42 };
      mockRedisClient.set.mockResolvedValue('OK');
      mockRedisClient.get.mockResolvedValue(JSON.stringify(data));

      await service.setJson('json-key', data);
      const result = await service.getJson<typeof data>('json-key');

      expect(result).toEqual(data);
    });

    it('should return null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      const result = await service.getJson('missing-key');
      expect(result).toBeNull();
    });

    it('should return null and log error when JSON is malformed', async () => {
      mockRedisClient.get.mockResolvedValue('not-valid-json{');
      const result = await service.getJson('bad-json-key');
      expect(result).toBeNull();
    });
  });

  describe('onModuleDestroy', () => {
    it('should quit the redis client', async () => {
      await service.onModuleDestroy();
      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });
});
