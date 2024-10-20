package blockchain

import (
	"github.com/jjhwan-h/DIDI/blockchain/utils"
)

func (b *blockchain) BalanceByRoom(roomId string) []byte {
	votes := make(map[string]int)
	hashCursor := b.NewestHash
	for {
		block, _ := FindBlock(hashCursor)
		if block.TxVote.RoomId == roomId {
			votes[block.TxVote.Choice] += 1
		}
		if block.PrevHash != "" {
			hashCursor = block.PrevHash
		} else {
			break
		}
	}
	data := utils.ToJson(votes)
	return data
}
