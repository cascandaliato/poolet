class DoublyLinkedNode<E> {
  next: DoublyLinkedNode<E> | null = null
  prev: DoublyLinkedNode<E> | null = null
  constructor(public readonly element: E) {}
}

export class DoublyLinkedList<E> {
  private _size: number = 0
  private head: DoublyLinkedNode<E> | null = null
  private tail: DoublyLinkedNode<E> | null = null

  addFirst(element: E): void {
    const node = new DoublyLinkedNode<E>(element)
    if (this.head) {
      node.next = this.head
      this.head.prev = node
    } else {
      this.tail = node
    }
    this.head = node
    this._size++
  }

  addLast(element: E): void {
    const node = new DoublyLinkedNode<E>(element)
    if (this.tail) {
      this.tail.next = node
      node.prev = this.tail
    } else {
      this.head = node
    }
    this.tail = node

    this._size++
  }

  removeFirst(): E {
    if (!this.head) throw new Error('Cannot remove from an empty list')
    const node = this.head
    this.head = this.head.next
    node.next = null
    if (!this.head) this.tail = null

    this._size--

    return node.element
  }

  removeLast(): E {
    if (!this.tail) throw new Error('Cannot remove from an empty list')
    const node = this.tail
    this.tail = this.tail.prev
    node.prev = null
    if (!this.tail) this.head = null
    this._size--

    return node.element
  }

  get size(): number {
    return this._size
  }
}
