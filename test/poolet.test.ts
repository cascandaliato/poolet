import { Poolet } from '../src/poolet'

describe('poolet', () => {
  test('acquire increases pool size if no resource is available', async () => {
    let i = 0
    const pool = new Poolet<number>({
      create: () => Promise.resolve(++i),
    })

    expect(pool.pending).toBe(0)
    pool.acquire()
    expect(pool.pending).toBe(1)
  })

  test('acquire calls resource factory if no resource is available', async () => {
    let i = 0
    const create = jest.fn(() => Promise.resolve(++i))
    const pool = new Poolet<number>({ create })

    await pool.acquire()
    expect(create.mock.calls.length).toBe(1)
  })

  test('acquire returns available resource', async () => {
    let i = 0
    const pool = new Poolet<number>({
      create: () => Promise.resolve(++i),
    })

    const one = await pool.acquire()
    await pool.acquire()
    await pool.release(one)

    expect(await pool.acquire()).toBe(one)
  })

  test('initial size when minAvailable is non-zero', async () => {
    let i = 0
    const pool = new Poolet<number>(
      {
        create: () => Promise.resolve(++i),
      },
      { minAvailable: 3 }
    )

    expect(pool.size).toBe(3)
  })

  test('initial size when minPoolSize is non-zero', async () => {
    let i = 0
    const pool = new Poolet<number>(
      {
        create: () => Promise.resolve(++i),
      },
      { minPoolSize: 7 }
    )

    expect(pool.size).toBe(7)
  })

  test('initial size when minAvailable and minPoolSize are both non-zero', async () => {
    let i = 0
    const pool = new Poolet<number>(
      {
        create: () => Promise.resolve(++i),
      },
      { minAvailable: 11, minPoolSize: 13 }
    )

    expect(pool.size).toBe(13)
  })

  test('minAvailable is maintained', async () => {
    let i = 0
    const pool = new Poolet<number>(
      {
        create: () => Promise.resolve(++i),
      },
      { minAvailable: 3 }
    )
    await pool.acquire()

    expect(pool.size).toBe(4)
  })
})
