import { Poolet } from '../src'

const flushPromises = () => new Promise(setImmediate)

describe('poolet', () => {
  describe('acquire', () => {
    test('increases pool size if no resource is available', async () => {
      let i = 0
      const pool = new Poolet<number>({ create: () => Promise.resolve(++i) })

      expect(pool.pending).toBe(0)
      pool.acquire()
      expect(pool.pending).toBe(1)
    })

    test('calls resource factory if no resource is available', async () => {
      let i = 0
      const create = jest.fn(() => Promise.resolve(++i))
      const pool = new Poolet<number>({ create })

      await pool.acquire()
      expect(create.mock.calls.length).toBe(1)
    })

    test('returns available resource', async () => {
      let i = 0
      const pool = new Poolet<number>({ create: () => Promise.resolve(++i) })

      const one = await pool.acquire()
      await pool.acquire()
      await pool.release(one)

      expect(await pool.acquire()).toBe(one)
    })
  })

  describe('initial size', () => {
    test('when minAvailable is non-zero', async () => {
      let i = 0
      const pool = new Poolet<number>(
        { create: () => Promise.resolve(++i) },
        { minAvailable: 3 }
      )

      expect(pool.size).toBe(3)
    })

    test('when minPoolSize is non-zero', async () => {
      let i = 0
      const pool = new Poolet<number>(
        { create: () => Promise.resolve(++i) },
        { minPoolSize: 7 }
      )

      expect(pool.size).toBe(7)
    })

    test('when minAvailable and minPoolSize are both non-zero', async () => {
      let i = 0
      const pool = new Poolet<number>(
        { create: () => Promise.resolve(++i) },
        { minAvailable: 11, minPoolSize: 13 }
      )

      expect(pool.size).toBe(13)
    })
  })

  test('minAvailable is maintained', async () => {
    let i = 0
    const pool = new Poolet<number>(
      { create: () => Promise.resolve(++i) },
      { minAvailable: 3 }
    )
    await pool.acquire()

    expect(pool.size).toBe(4)
  })

  test('pending counter is reset if resource creation fails', async () => {
    const pool = new Poolet<number>({
      create: () => Promise.reject('foo'),
    })

    pool.acquire()
    await flushPromises()

    expect(pool.pending).toBe(0)
    expect(pool.size).toBe(0)
  })

  describe('release', () => {
    test('adds a resource back into the pool if nobody else needs it', async () => {
      let i = 0
      const pool = new Poolet<number>({ create: () => Promise.resolve(++i) })

      const resource = await pool.acquire()
      await pool.acquire()
      expect(pool.ready).toBe(0)

      await pool.release(resource)
      expect(pool.ready).toBe(1)
    })

    test('sends the resource to a pending acquire', async () => {
      let i = 0
      const pool = new Poolet<number>(
        { create: () => Promise.resolve(++i) },
        { maxPoolSize: 1 }
      )
      const resource = await pool.acquire()
      const promisedResource = pool.acquire()

      pool.release(resource)

      expect(await promisedResource).toBe(resource)
    })
  })

  describe('destroy', () => {
    test('gets called when more than maxAvailable resources become available', async () => {
      const destroy = jest.fn(() => Promise.resolve(true))

      let i = 0
      const pool = new Poolet<number>(
        { create: () => Promise.resolve(++i), destroy },
        { maxAvailable: 1 }
      )

      const resource1 = await pool.acquire()
      const resource2 = await pool.acquire()
      pool.release(resource1)
      pool.release(resource2)

      expect(destroy.mock.calls).toEqual([[1]])
    })

    test('ignores exceptions', async () => {
      const destroy = jest.fn(() => Promise.reject('foo'))

      let i = 0
      const pool = new Poolet<number>(
        { create: () => Promise.resolve(++i), destroy },
        { maxAvailable: 1 }
      )

      const resource1 = await pool.acquire()
      const resource2 = await pool.acquire()
      pool.release(resource1)
      pool.release(resource2)

      await flushPromises()

      expect(pool.size).toBe(1)
    })
  })
})
