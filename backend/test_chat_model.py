from app.ai_client import get_ai_client, MODEL_NAME
import asyncio

async def test_chat():
    client = get_ai_client()
    if not client:
        print("Client init failed")
        return

    print(f"Testing model: {MODEL_NAME}")
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents="Hello, this is a test."
        )
        print("Success!")
        print(response.text)
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_chat())
