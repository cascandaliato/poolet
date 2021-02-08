import { Queue } from './queue'

type Resolver<E> = (value: E | PromiseLike<E>) => void
type Rejecter = (reason?: any) => void

type Listener<E> = {
  resolve: Resolver<E>
  reject: Rejecter
  // timer?: NodeJS.Timeout // TODO: fix jest/ts
  timer?: any
}

export type ResourceFactory<RESOURCE> = {
  create: () => Promise<RESOURCE>
  destroy?: (resource: RESOURCE) => Promise<boolean>
  test?: (resource: RESOURCE) => boolean
}

export type PoolOptions = {
  // acquireIncrement: number
  minPoolSize: number
  maxPoolSize: number
  minAvailable: number
  maxAvailable: number
  // testBeforeAcquire: boolean
  // testAfterRelease: boolean
}

const DEFAULT_POOL_OPTIONS: Readonly<PoolOptions> = {
  // acquireIncrement: 1,
  minPoolSize: 0,
  maxPoolSize: +Infinity,
  minAvailable: 0,
  maxAvailable: +Infinity,
  // testBeforeAcquire: false,
  // testAfterRelease: false,
}

export class Poolet<RESOURCE> {
  private options: PoolOptions
  private promises = new Queue<Listener<RESOURCE>>()
  private resources = new Queue<RESOURCE>()
  private counters = { acquired: 0, pending: 0 }

  /**
   * TODO: validate options
   *   minPoolSize<=maxPoolSize
   *   minPoolSize>=minAvailable
   */
  constructor(
    private factory: ResourceFactory<RESOURCE>,
    options: Partial<PoolOptions> = {}
  ) {
    this.options = {
      ...DEFAULT_POOL_OPTIONS,
      ...options,
    }
    this.rebalance()
  }

  async acquire(): Promise<RESOURCE> {
    let resource: Promise<RESOURCE>

    if (this.resources.size > 0) {
      this.counters.acquired++
      resource = Promise.resolve(this.resources.remove())
    } else {
      resource = new Promise<RESOURCE>((resolve, reject) =>
        this.promises.add({
          resolve,
          reject,
        })
      )
    }
    this.rebalance()
    return resource
  }

  release(resource: RESOURCE): void {
    this.counters.acquired--
    this.enqueue(resource)
  }

  private rebalance(): void {
    // min size
    this.createResources(Math.max(this.options.minPoolSize - this.size, 0))

    // check min available and max size
    const eventuallyAvailable =
      this.counters.pending + this.resources.size - this.promises.size
    const gap = Math.max(this.options.minAvailable - eventuallyAvailable, 0)
    const toCreate = Math.min(this.options.maxPoolSize - this.size, gap)
    this.createResources(toCreate)

    // destroy excess resources
    if (this.factory.destroy) {
      const excess = Math.max(
        0,
        this.counters.pending +
          this.resources.size -
          this.promises.size -
          this.options.maxAvailable
      )

      for (let i = 0; i < excess; i++) {
        this.factory.destroy(this.resources.remove()).catch(() => {
          /* TODO: do something? */
        })
      }
    }
  }

  private createResources(n: number): void {
    for (let i = 0; i < n; i++) {
      this.factory
        .create()
        .then(resource => {
          this.counters.pending--
          this.enqueue(resource)
        })
        .catch(() => {
          this.counters.pending--
          // TODO: retry? log?
        })
      this.counters.pending++
    }
  }

  private enqueue(resource: RESOURCE): void {
    if (this.promises.size > 0) {
      const { resolve } = this.promises.remove()
      this.counters.acquired++
      this.rebalance()
      resolve(resource)
    } else {
      this.resources.add(resource)
      this.rebalance()
    }
  }

  get size(): number {
    return this.counters.acquired + this.counters.pending + this.resources.size
  }

  get pending(): number {
    return this.counters.pending
  }

  get ready(): number {
    return this.resources.size
  }
}
