import { DoublyLinkedList } from '../src/doubly-linked-list'

describe('DoublyLinkedList', () => {
  describe('addFirst', () => {
    it('when list is empty', () => {
      const list = new DoublyLinkedList<number>()
      list.addFirst(42)
      expect(list.removeFirst()).toBe(42)
    })

    it('when list is not empty', () => {
      const list = new DoublyLinkedList<number>()
      list.addFirst(1)
      list.addFirst(0)

      list.addFirst(42)
      expect(list.removeFirst()).toBe(42)
    })
  })

  describe('removeLast', () => {
    it('when list is empty throws exception', () => {
      const list = new DoublyLinkedList<number>()
      expect(() => list.removeLast()).toThrow(
        'Cannot remove from an empty list'
      )
    })

    it('when list has one element', () => {
      const list = new DoublyLinkedList<number>()
      list.addFirst(0)

      expect(list.removeLast()).toBe(0)
    })

    it('when list has two elements', () => {
      const list = new DoublyLinkedList<number>()
      list.addFirst(0)
      list.addLast(42)

      expect(list.removeLast()).toBe(42)
    })
  })
})
