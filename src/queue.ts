class Node<E> {
  next: Node<E> | null = null
  prev: Node<E> | null = null
  constructor(public readonly element: E) {}
}

export class Queue<E> {
  private _size: number = 0
  private head: Node<E> | null = null
  private tail: Node<E> | null = null

  add(element: E): void {
    const node = new Node<E>(element)
    if (this.tail) {
      this.tail.next = node
      node.prev = this.tail
    } else {
      this.head = node
    }
    this.tail = node

    this._size++
  }

  remove(): E {
    if (!this.head) throw new Error('Cannot remove from an empty list')
    const node = this.head
    this.head = this.head.next
    node.next = null
    if (!this.head) this.tail = null

    this._size--

    return node.element
  }

  get size(): number {
    return this._size
  }
}
