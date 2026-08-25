export function isSafeNext(next: string | null): string {
  if (!next) return '/dashboard'
  if (!next.startsWith('/')) return '/dashboard'
  if (next.startsWith('//') || next.startsWith('/\\')) return '/dashboard'
  return next
}

export function getInitials(name:string | undefined){
    if(!name){
        return "G"
    }
    if(name.split(" ").length === 1){
        return name[0].toUpperCase()
    }
    const names = name.split(" ")
    return (names[0][0] + names[names.length-1][0]).toUpperCase()
}