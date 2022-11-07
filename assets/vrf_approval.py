from pyteal import *

def approval_program():
    handle_creation = Seq([
        App.globalPut(Bytes("OldNumber"), Int(0)),
        App.globalPut(Bytes("Number"), Int(0)),
        Return(Int(1))
    ])

    scratchNumber = ScratchVar(TealType.uint64)

    random_number = Seq([
        scratchNumber.store(App.globalGet(Bytes("Number"))),
        App.globalPut(Bytes("OldNumber"), scratchNumber.load()),

        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.MethodCall(
            app_id=Int(110096026),
            method_signature="get(uint64,byte[])byte[]",
            args=[Txn.application_args[1], Txn.application_args[2]],
        ),
        InnerTxnBuilder.Submit(),
        App.globalPut(Bytes("Number"), Btoi(Substring(InnerTxn.last_log(), Int(2), Int(34)))),
        Return(Int(1))
    ])

    handle_noop = Seq(
        Cond(
            [Txn.application_args[0] == Bytes("Random"), random_number]
        )
    )

    handle_optin = Return(Int(0))
    handle_closeout = Return(Int(0))
    handle_updateapp = Return(Int(0))
    handle_deleteapp = Return(Int(1))

    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
        [Txn.on_completion() == OnComplete.CloseOut, handle_closeout],
        [Txn.on_completion() == OnComplete.UpdateApplication, handle_updateapp],
        [Txn.on_completion() == OnComplete.DeleteApplication, handle_deleteapp],
        [Txn.on_completion() == OnComplete.NoOp, handle_noop]
    )

    return compileTeal(program, Mode.Application, version=6)

# print out the results
print(approval_program())