import { Queue } from '../src/queue'

describe('Queue', () => {
  describe('remove', () => {
    it('when list is empty throws exception', () => {
      const list = new Queue<number>()
      expect(() => list.remove()).toThrow('Cannot remove from an empty list')
    })

    it('when list has one element', () => {
      const list = new Queue<number>()
      list.add(0)

      expect(list.remove()).toBe(0)
    })

    it('when list has two elements', () => {
      const list = new Queue<number>()
      list.add(0)
      list.add(42)

      expect(list.remove()).toBe(0)
      expect(list.remove()).toBe(42)
    })
  })
})
